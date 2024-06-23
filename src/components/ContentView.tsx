import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, ScrollView, Alert } from 'react-native';
import TTS from '../utils/useTTS';
import Tts from 'react-native-tts';
import styles from '../utils/styles';
import InstructionList from './InstructionList';
// import InstructionEditor from './InstructionEditor';
import { loadInstructions, saveInstruction, deleteInstruction } from '../utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const ContentView: React.FC = () => {
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dictatePhase, setDictatePhase] = useState<DictatePhase>(DictatePhase.InstructionList);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchInstructions = async () => {
      const loadedInstructions = await loadInstructions();
      setInstructions(loadedInstructions);
    };
    fetchInstructions();

    TTS.initializeTTS('en-US');

    const onTTSFinish = () => {
      console.log('TTS finished');
    };

    const onTTSStart = () => {
      console.log('TTS started');
    };

    Tts.addEventListener('tts-finish', onTTSFinish);
    Tts.addEventListener('tts-start', onTTSStart);

    return () => {
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-start');
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      dictatePhase === DictatePhase.Dictating &&
      steps.length > 0 &&
      currentStepIndex < steps.length
    ) {
      TTS.speak(steps[currentStepIndex].text);
      if (steps[currentStepIndex].duration) {
        setCountdown(steps[currentStepIndex].duration ?? null);
        timer = setInterval(() => {
          setCountdown(prevCountdown => {
            if (prevCountdown && prevCountdown > 1) {
              return prevCountdown - 1;
            } else {
              clearInterval(timer);
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
      TTS.speak('Mission accomplished!');
    }

    return () => {
      TTS.stop(); // Останавливаем любую озвучку
      clearInterval(timer);
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
    setCurrentStepIndex(0);
    setDictatePhase(DictatePhase.Dictating);
    if (steps.length > 0 && currentStepIndex === 0) {
      TTS.speak(steps[0].text);
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStepIndex(nextIndex);
    } else {
      setDictatePhase(DictatePhase.MissionAccomplished);
    }
  };

  const handleBack = () => {
    const backIndex = currentStepIndex - 1;
    if (backIndex >= 0) {
      setCurrentStepIndex(backIndex);
    } else {
      TTS.speak(steps[currentStepIndex].text);
    }
  };

  const handleRepeat = () => {
    if (currentStepIndex < steps.length) {
      TTS.speak(steps[currentStepIndex].text); // Повторно прочитать текущий шаг
    }
  };

  const handleBackToInstructions = () => {
    setDictatePhase(DictatePhase.InstructionList);
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
              placeholder="Enter steps, each on a new line"
            />
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
        );
      case DictatePhase.Dictating:
        return (
          <View style={styles.dictatePage}>
            <Text style={styles.headline}>
              Step {currentStepIndex + 1}: {steps[currentStepIndex].text}
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
              onPress={handleBackToInstructions}
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
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.headline}>Dictator</Text>
      {renderDictatePhase()}
    </View>
  );
};

export default ContentView;
