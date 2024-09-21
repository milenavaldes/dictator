import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import TTS from '../utils/useTTS';
import SpeechManager from './SpeechManager';
import styles from '../utils/styles';
import KeepAwake from 'react-native-keep-awake';
import InstructionList from './InstructionList';
import { loadInstructions, saveInstruction, deleteInstruction } from '../utils/storage';
import uuid from 'react-native-uuid';

enum DictatePhase {
  InstructionList = 'InstructionList',
  Creating = 'Creating',
  ViewingChanges = 'ViewingChanges',
  Editing = 'Editing',
  ReadyToDictate = 'ReadyToDictate',
  Dictating = 'Dictating',
  MissionAccomplished = 'MissionAccomplished',
}

interface Step {
  text: string;
  duration?: number | null;
}

interface Instruction {
  id: string;
  title: string;
  steps: Step[];
}

interface SpeechRecognitionResult {
  value?: string[];  // Массив распознанных слов или фраз
}

const ContentView: React.FC = () => {
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dictatePhase, setDictatePhase] = useState<DictatePhase>(DictatePhase.InstructionList);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [repeatTrigger, setRepeatTrigger] = useState(false);
  const assets = {
    buttonBack: require('../utils/assets/icons/buttonBack.png'),
    buttonRepeat: require('../utils/assets/icons/buttonRepeat.png'),
    buttonNext: require('../utils/assets/icons/buttonNext.png'),
  };

  const confirmDeleteInstruction = (id: string) => {
    Alert.alert(
      'Delete Instruction',
      'Are you sure you want to delete this instruction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            setInstructions(prev => prev.filter(instruction => instruction.id !== id));
          },
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };


  // Instructions
useEffect(() => {
  const fetchInstructions = async () => {
    const loadedInstructions = await loadInstructions();
    setInstructions(loadedInstructions);
  };
  fetchInstructions();
}, []);

// useEffect for REPEAT
useEffect(() => {
  if (repeatTrigger) {
    console.log('Repeat triggered');
    
    SpeechManager.stopRecognizing();
    setTimeout(() => {
      SpeechManager.startRecognizing(); 
      TTS.speak(steps[currentStepIndex].text);
      
    }, 500);
  }
}, [repeatTrigger]); 


useEffect(() => {
  let timer: NodeJS.Timeout;

  // Если фаза диктовки активна и есть шаги для диктовки
  if (dictatePhase === DictatePhase.Dictating && steps.length > 0 && currentStepIndex < steps.length) {

    // Обработчик старта TTS
    const handleTTSStart = () => {
      console.log('TTS started');
      SpeechManager.destroy(); // Полностью останавливаем распознавание речи
      console.log('Speech recognition completely stopped during TTS');
    };

    // Обработчик завершения TTS
    const handleTTSFinish = () => {
      console.log('TTS finished');
      // Инициализация и запуск распознавания речи после завершения TTS
      SpeechManager.initialize(handleSpeechResults); 
      SpeechManager.startRecognizing(); 
      console.log('Speech recognition restarted after TTS');
    };

    // Обработчик старта распознавания речи
    const handleSpeechStart = () => {
      console.log('Speech recognition started');
    };

    // Обработчик результатов распознавания речи
    const handleSpeechResults = (result: SpeechRecognitionResult) => {
      console.log('Received speech results:', result);
      const commands = result.value ? result.value.join(' ').toLowerCase() : '';
      if (commands.includes('next')) {
        console.log('Command "next" recognized');
        handleNext();
      } else if (commands.includes('back')) {
        console.log('Command "back" recognized');
        handleBack();
      } else if (commands.includes('repeat')) {
        console.log('Command "repeat" recognized');
        handleRepeat();
      } else if (commands.includes('exit')) {
        console.log('Command "exit" recognized');
        handleMissionAbort();
      } else {
        console.log('Command was not recognized');
        result.value = [];
      }
    };

    // Обработчик ошибок распознавания речи (например, тайм-аут)
    const handleRecognitionError = (error: { message: string; code?: string }) => {
      if (error.message === "203/Retry" || error.code === "recognition_fail") {
        console.log("Speech recognition timed out, restarting...");
        // Перезапуск распознавания после тайм-аута
        SpeechManager.stopRecognizing();
        setTimeout(() => {
          SpeechManager.startRecognizing();
        }, 1000); // Небольшая задержка перед перезапуском
      }
    };

    // Добавляем слушателей для TTS
    TTS.addListener('tts-start', handleTTSStart);
    TTS.addListener('tts-finish', handleTTSFinish);

    // Инициализация и запуск распознавания речи
    SpeechManager.initialize(handleSpeechResults);
    console.log('SpeechManager initialized');
    SpeechManager.startRecognizing();
    console.log('SpeechManager initialized and started recognizing');
    console.log(`Speaking step: ${steps[currentStepIndex].text}`);

    KeepAwake.activate(); // Оставляем экран активным

    // Задержка перед началом TTS, чтобы завершить все инициализации
    setTimeout(() => {
      TTS.speak(steps[currentStepIndex].text);
    }, 500); 

    // Таймер для шагов, если у шага есть продолжительность
    if (steps[currentStepIndex].duration) {
      setCountdown(steps[currentStepIndex].duration ?? null);
      timer = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown && prevCountdown > 1) {
            return prevCountdown - 1;
          } else {
            clearInterval(timer);
            console.log('Interval cleared, moving to the next step');
            handleNext();
            return null;
          }
        });
      }, 1000);
    }
  } else {
    // Обнуляем таймер, если не в фазе диктовки
    setCountdown(null);
  }

  // Обработка фазы завершения миссии
  if (dictatePhase === DictatePhase.MissionAccomplished) {
    console.log('Mission accomplished!');

    const handleTTSStart = () => {
      console.log('TTS started for Mission Accomplished');
    };

    const handleTTSFinish = () => {
      console.log('TTS finished for Mission Accomplished');
      TTS.removeAllListeners(); // Удаляем слушателей после завершения
    };

    // Добавляем временные слушатели
    TTS.addListener('tts-start', handleTTSStart);
    TTS.addListener('tts-finish', handleTTSFinish);

    TTS.speak('Mission accomplished!');
    KeepAwake.deactivate();
  }

  // Очистка ресурсов при выходе из фазы
  return () => {
    SpeechManager.destroy();
    console.log('Cleaning up: Removing TTS listeners and stopping TTS');
    TTS.removeAllListeners();
    TTS.stop();
    clearInterval(timer);
    KeepAwake.deactivate();
    SpeechManager.stopRecognizing();
  };
}, [currentStepIndex, dictatePhase, steps]);

  const parseStep = (stepText: string): Step => {
    const match = stepText.match(/\((\d+)\)$/);
    const duration = match ? parseInt(match[1], 10) : null;
    const text = match ? stepText.replace(/\s*\(\d+\)$/, '') : stepText;
    return { text: text.trim(), duration };
  };

  const startCreating = () => {
    setCurrentTitle('');
    setCurrentStep('');
    setSteps([]);
    setDictatePhase(DictatePhase.Creating);
  };

  const finishCreating = () => {
    if (currentStep.trim() !== '' && currentTitle.trim() !== '') {
      const stepLines = currentStep.split('\n');
      const newSteps = stepLines.map(line => parseStep(line.trim())).filter(step => step.text.length > 0);
      const newInstruction: Instruction = {
        id: uuid.v4().toString(),
        title: currentTitle,
        steps: newSteps,
      };
      saveInstruction(newInstruction).then(() => {
        setInstructions(prev => [...prev, newInstruction]);
        setSelectedInstruction(newInstruction);
        setSteps(newSteps);
        setDictatePhase(DictatePhase.ViewingChanges);
      });
    }
  };

  const handleSaveInstruction = async (instruction: Instruction) => {
    await saveInstruction(instruction);
    const updatedInstructions = await loadInstructions();
    setInstructions(updatedInstructions);
    setSelectedInstruction(instruction);
  };

  const handleDeleteInstruction = async (id: string) => {
    Alert.alert(
      'Delete Instruction',
      'Are you sure you want to delete this instruction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteInstruction(id);
            const updatedInstructions = await loadInstructions();
            setInstructions(updatedInstructions);
          },
        },
      ],
    );
  };

  const startEditing = () => {
    if (selectedInstruction) {
      setCurrentTitle(selectedInstruction.title);
      const stepsText = selectedInstruction.steps.map(step => `${step.text}${step.duration ? ` (${step.duration})` : ''}`).join('\n');
      setCurrentStep(stepsText);
    }
    setDictatePhase(DictatePhase.Editing);
  }; 

  const finishEditing = () => {
    const newSteps = currentStep.split('\n').map(line => parseStep(line.trim())).filter(step => step.text.length > 0);
  
    if (selectedInstruction) {
      const updatedInstruction = {
        ...selectedInstruction,
        title: currentTitle,
        steps: newSteps,
      };
  
      handleSaveInstruction(updatedInstruction).then(() => {
        setSteps(newSteps);
        setDictatePhase(DictatePhase.ViewingChanges);
      });
    }
  };

  const confirmDiscardChanges = () => {
    Alert.alert(
      "Don't Save",
      "Are you sure you don't want to Save?",
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setDictatePhase(DictatePhase.ViewingChanges);
          },
        },
      ],
    );
  };

  const handleStartDictate = () => {
    const stepsTotal = steps.length;
    console.log('handleStartDictate:',stepsTotal, steps);
    setCurrentStepIndex(0);
    console.log('setCurrentStepIndex(0)');
    setDictatePhase(DictatePhase.Dictating);
    console.log('setDictatePhase(DictatePhase.Dictating)');
  }; 

  
  const handleNext = () => {
    SpeechManager.stopRecognizing();

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStepIndex(nextIndex);
      setTimeout(() => {
        SpeechManager.startRecognizing();  // Перезапускаем распознавание после небольшой задержки
      }, 500);
    } else {
      setDictatePhase(DictatePhase.MissionAccomplished);
    }
  };

  const handleBack = () => {
    SpeechManager.stopRecognizing();

    const backIndex = currentStepIndex - 1;
    if (backIndex >= 0) {
      setCurrentStepIndex(backIndex);
      setTimeout(() => {
        SpeechManager.startRecognizing();  // Перезапускаем распознавание после небольшой задержки
      }, 500);
    } else {
      setDictatePhase(DictatePhase.MissionAccomplished);
    }
  };


  const handleRepeat = () => {
    setRepeatTrigger(prev => !prev);
  };

  const handleBackToInstructions = () => {
    
    setDictatePhase(DictatePhase.InstructionList);
  };

  const handleMissionAbort = () => {
    setDictatePhase(DictatePhase.InstructionList);
    KeepAwake.deactivate();
  };

  const renderStepsList = (list: Step[], title: string) => (
    <>
      <Text style={styles.headline}>{title}</Text>
      <FlatList
        data={list}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.listItem}>{`${index + 1}. ${item.text} ${item.duration ? `(Duration: ${item.duration} s)` : ''}`}</Text>
        )}
        style={styles.list}
      />
    </>
  );

  const renderDictatePhase = () => {
    switch (dictatePhase) {
      case DictatePhase.InstructionList:
        return (
          <InstructionList
            instructions={instructions}
            onSelect={(instruction) => {
              setSelectedInstruction(instruction);
              setSteps(instruction.steps);
              setDictatePhase(DictatePhase.ViewingChanges);
            }}
            onCreate={startCreating}
            onDelete={handleDeleteInstruction}
            onStart={(instruction) => {
              setSelectedInstruction(instruction);
              setSteps(instruction.steps);
              setDictatePhase(DictatePhase.ReadyToDictate);
            }}
          />
        );
      case DictatePhase.Creating:
        return (
          <>
            <Text style={styles.headline}>Create your instructions:</Text>
            
            <TextInput
              placeholder="Title"
              value={currentTitle}
              onChangeText={setCurrentTitle}
              style={styles.instructionTitleInput}
            />
            <TextInput
              multiline
              value={currentStep}
              onChangeText={setCurrentStep}
              style={styles.textInput}
              placeholder="Enter steps, each on a new line."
            />
            <Text style={styles.textComment}>
             If you want to add a timer for your step, put the number of seconds in the brackets. {"\n"}Example: "Continue doing this step for a minute (60)"
             </Text>
            <View style={styles.creatingButtonContainer}>
              <Button title="Don't Save" onPress={handleBackToInstructions} color="red" />
              <Button title="Save" onPress={finishCreating} color="green" />
            </View>
          </>
        );
      case DictatePhase.Editing:
        return (
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.headline}>Edit your instruction:</Text>
            <TextInput
              multiline
              value={currentTitle}
              onChangeText={setCurrentTitle}
              style={styles.instructionTitleInput}
              placeholder="Enter title"
            />
            <TextInput
              multiline
              value={currentStep}
              onChangeText={setCurrentStep}
              style={styles.textInput}
              placeholder="Enter steps, new line for each step"
            />
              <Text style={styles.textComment}>
             If you want to add a timer for your step, put the number of seconds in the brackets. {"\n"}Example: "Continue doing this step for a minute (60)"
             </Text>
             <View style={styles.editingButtonContainer}>
             <Button title="Don't Save" onPress={confirmDiscardChanges} color="red" />
            <Button title="Save" onPress={finishEditing} color="green" />
            </View>
          </ScrollView>
        );
        
      case DictatePhase.ViewingChanges:

        return (
          <>
            <Text style={styles.headline}>
              Here is your instruction. Would you like to make any changes?
            </Text>
            <Text style={styles.instructionTitle}>{currentTitle}</Text>
            {renderStepsList(steps, 'Steps')}
            <View style={styles.instructionButtonContainer}>
              <Button title="Delete" onPress={() => confirmDeleteInstruction(selectedInstruction?.id ?? '')} color="red" />
              <Button title="Edit" onPress={startEditing} color="gray" />
              <Button
                title="Back"
                onPress={() => setDictatePhase(DictatePhase.InstructionList)}
                color="blue"
              />
              
              <Button title="Start" onPress={handleStartDictate} color="green" />
            </View>
          </>
        );
      case DictatePhase.Dictating:
        return (
          <View style={styles.dictatePage}>

            <Button
              title="Exit"
              onPress={handleMissionAbort}
              color="red"
            />

            {countdown !== null && (
              <Text style={styles.countdown}>{countdown} s</Text>
            )}
            <Text style={styles.dictatingTextContainer}>
              <Text style={styles.stepOfSteps}>Step {currentStepIndex + 1} of {steps.length}</Text>
              {'\n'}
              <Text style={styles.stepTextDictating}>{steps[currentStepIndex].text}</Text>
            </Text>

        
            <View style={styles.dictatingButtonContainer}>
              <TouchableOpacity onPress={handleBack}>
                <Image source={assets.buttonBack} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRepeat}>
                <Image source={assets.buttonRepeat} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext}>
                <Image source={assets.buttonNext} />
              </TouchableOpacity>
            </View>
          </View>
        );
      case DictatePhase.MissionAccomplished:
        return (
          <View style={styles.dictatePage}>
            <Text style={styles.headline}>Mission Accomplished!</Text>
            <Button
              title="Back to Instructions"
              onPress={() => {
                setDictatePhase(DictatePhase.InstructionList);
              }}
              color="blue"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
      ]}
    >
      <Text style={styles.headline}>Dictator</Text>
      {renderDictatePhase()}
    </View>
  );
};

export default ContentView;
