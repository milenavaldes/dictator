import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, ScrollView, Alert } from 'react-native';
import AudioSession from 'react-native-audio-session';
import TTS from '../utils/useTTS';
import Tts from 'react-native-tts';
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


  // // TTS Initializer
  // useEffect(() => {
  //   console.log('Component mounted');
  //   console.log('Initializing TTS...');
  //   TTS.initializeTTS(); // Инициализация TTS
  //   console.log('TTS initialized and active');
    
  //   console.log('Initializing SpeechManager...');
  //   SpeechManager.initialize(); // Инициализация менеджера распознавания речи
  //   console.log('SpeechManager initialized');

  //   const handleTTSStart = () => console.log('TTS started');
  //   const handleTTSFinish = () => console.log('TTS finished');
  //   const handleTTSProgress = () => console.log('TTS progress');


  //   TTS.addListener('tts-start', handleTTSStart);
  //   TTS.addListener('tts-finish', handleTTSFinish);
  //   TTS.addListener('tts-progress', handleTTSProgress);

  //   return () => {
     
  //     // TTS.removeListener('tts-start', handleTTSStart);
  //     // console.log('removeListener TTS start');
  //     // TTS.removeListener('tts-finish', handleTTSFinish);
  //     // console.log('removeListener TTS finish');
  //     // SpeechManager.destroy(); // Очистка при размонтировании
  //     // console.log('SpeechManager destroyed');
  //   };
  // }, []);

  // Instructions
  useEffect(() => {
    const fetchInstructions = async () => {
      const loadedInstructions = await loadInstructions();
      setInstructions(loadedInstructions);
    };
    fetchInstructions();
  }, []);

  useEffect(() => {
    // Ваш код для повторного воспроизведения текущего шага
    if (repeatTrigger) {
      // Здесь можете вызвать ваш код, который нужно выполнить при перезапуске
      console.log('Repeat triggered');
      
      // Например, остановка и запуск распознавания:
      SpeechManager.stopRecognizing();
      setTimeout(() => {
        SpeechManager.startRecognizing(); 
        TTS.speak(steps[currentStepIndex].text);
        
      }, 500);
      

      // setTimeout(() => {
      //   SpeechManager.startRecognizing();
      // }, 500);
    }
  }, [repeatTrigger]); 

// useEffect(() => {
//   const handleSpeechResults = (result: SpeechRecognitionResult) => {
//     console.log('Received speech results:', result);
//     const commands = result.value ? result.value.join(' ').toLowerCase() : '';
//     if (commands.includes('next')) {
//       console.log('Command "next" recognized');
//       handleNext();
//     } else if (commands.includes('back')) {
//       console.log('Command "back" recognized');
//       handleBack();
//     } else if (commands.includes('repeat')) {
//       console.log('Command "repeat" recognized'); 
//       handleRepeat();
//     } else if (commands.includes('abort')) {
//       console.log('Command "abort" recognized');
//       handleMissionAbort();
//     } else {
//       console.log('Command was not recognized');
//       result.value = [];
//     }
//   };

//   SpeechManager.onSpeechResults(handleSpeechResults);

//   return () => {
//     SpeechManager.stopRecognizing(); // Остановка распознавания речи при необходимости
//   };
// }, []);

  // // Dictate phase handler

  // useEffect(() => {
  //   const stepsTotal = steps.length;
  //   console.log('useEffect triggered:', { currentStepIndex, dictatePhase, stepsTotal, steps });
  //   if (dictatePhase === DictatePhase.Dictating && steps.length > 0 && currentStepIndex < steps.length) {
  //     console.log(`Ready to speak: ${steps[currentStepIndex].text}`);
  //     TTS.speak(steps[currentStepIndex].text);
  //     SpeechManager.startRecognizing();
  //   } else if (dictatePhase === DictatePhase.MissionAccomplished) { 
  //     console.log('Mission accomplished!');
  //     TTS.speak('Mission accomplished!');
  //   }
  // }, [currentStepIndex, dictatePhase, steps]);  

  // Keep awake
  // useEffect(() => {
  //   if (dictatePhase === DictatePhase.Dictating) {
  //     KeepAwake.activate();
  //     AudioSession.setCategoryAndMode('Playback', 'VoiceChat', 'MixWithOthers').catch(console.error);
  //   } else if (dictatePhase === DictatePhase.MissionAccomplished) {
  //     KeepAwake.deactivate();
  //   }
  // }, [dictatePhase]);

  useEffect(() => {
        let timer: NodeJS.Timeout;
        if (dictatePhase === DictatePhase.Dictating && steps.length > 0 && currentStepIndex <= steps.length) {


          const handleTTSStart = () => console.log('TTS started');
          const handleTTSFinish = () => console.log('TTS finished');
          const handleTTSProgress = () => console.log('TTS progress');

          TTS.addListener('tts-start', handleTTSStart);
          TTS.addListener('tts-finish', handleTTSFinish);
          TTS.addListener('tts-progress', handleTTSProgress);

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
            } else if (commands.includes('abort')) {
              console.log('Command "abort" recognized');
              handleMissionAbort();
            } else {
              console.log('Command was not recognized');
              result.value = [];
            }
          };

          SpeechManager.initialize(handleSpeechResults); // Инициализация менеджера распознавания речи
          console.log('SpeechManager initialized');

          SpeechManager.startRecognizing();
          console.log('SpeechManager.startRecognizing()');
          console.log('Starting recognition for dictating phase');
          console.log(`Speaking step: ${steps[currentStepIndex].text}`);

          KeepAwake.activate();

          // TTS.speak(steps[currentStepIndex].text);

          setTimeout(() => {
            TTS.speak(steps[currentStepIndex].text); 
          }, 500); // Delay TTS to ensure cleanup and setup are complete


          
          
          
          
          // Timer
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
          setCountdown(null);
        }
    
        if (dictatePhase === DictatePhase.MissionAccomplished) {
          console.log('Mission accomplished!');
          TTS.speak('Mission accomplished!');
          KeepAwake.deactivate();
        }
    
        return () => {
          SpeechManager.destroy();
          console.log('Cleaning up: Removing TTS listeners and stopping TTS');
          Tts.removeAllListeners('tts-finish');
          Tts.removeAllListeners('tts-progress');
          Tts.removeAllListeners('tts-start');
          TTS.stop();
          clearInterval(timer);
          if (dictatePhase === DictatePhase.Dictating) {
            console.log('Deactivating Keep Awake and stopping recognition');
            KeepAwake.deactivate();
            SpeechManager.stopRecognizing();
          } 
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
      'Discard Changes',
      'Are you sure you want to discard your changes?',
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
    // if (steps.length > 0 && currentStepIndex === 0) {
    //   console.log('TTS.speak from handleStartDictate:', steps[0].text);
    //   TTS.speak(steps[0].text);
    //   console.log('TTS.speak from handleStartDictate');
    // }
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
            <Button title="Save Changes" onPress={finishEditing} color="green" />
            <Button title="Discard changes" onPress={confirmDiscardChanges} color="red" />
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
            <View style={styles.buttonContainer}>
              <Button title="Edit" onPress={startEditing} color="gray" />
              <Button
                title="Ok"
                onPress={() => setDictatePhase(DictatePhase.InstructionList)}
                color="blue"
              />
            </View>
          </>
        );
      case DictatePhase.ReadyToDictate:
        return (
          <View style={styles.dictatePage}>
          <Text style={styles.headline}>Ready to Dictate</Text>
            <View style={styles.readyToDictateButtonContainer}>
              <Button
                title="Start Dictate"
                onPress={handleStartDictate}
                color="green"
              />
              <Button
                title="Back to Instructions"
                onPress={handleBackToInstructions}
                color="blue"
              />
            </View>
          </View>
        );
      case DictatePhase.Dictating:
        return (
          <View style={styles.dictatePage}>
            <Text style={styles.headline}>
            <Text style={styles.stepOfSteps}>Step {currentStepIndex + 1} of {steps.length}</Text>
            {'\n'}
            <Text>{steps[currentStepIndex].text}</Text>
          </Text>
            {countdown !== null && (
              <Text style={styles.countdown}>{countdown} s</Text>
            )}
            <View style={styles.buttonContainer}>
              <Button title="Back" onPress={handleBack} color="red" />
              <Button
                title="Repeat"
                onPress={handleRepeat}
                color="gray"
              />
              <Button title="Next" onPress={handleNext} color="blue" />
            </View>
            <Button
              title="Mission Abort"
              onPress={handleMissionAbort}
              color="red"
            />
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
