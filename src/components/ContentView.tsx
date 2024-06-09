import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, ScrollView } from 'react-native';
import TTS from '../utils/useTTS';
import styles from '../utils/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

enum DictatePhase {
  Creating = 'Creating',
  ViewingChanges = 'ViewingChanges',
  Editing = 'Editing',
  ReadyToDictate = 'ReadyToDictate',
  Dictating = 'Dictating',
  MissionAccomplished = 'MissionAccomplished',
}

const ContentView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<string>('');
  const [steps, setSteps] = useState<string[]>([
    "Good morning, everyone.",
    "Today,",
    "we stand at the forefront",
    "of a technological revolution",
    "powered by artificial intelligence.",
    "AI",
    "is not just a buzzword;",
    "it is transforming industries",
    "from healthcare to finance",
    "creating unprecedented opportunities",
    "for innovation.",
    "As we delve deeper",
    "into AI research,",
    "we must also address",
    "the ethical implications",
    "and ensure",
    "that these technologies",
    "are used responsibly.",
    "Collaboration",
    "between academia,",
    "industry,",
    "and government",
    "is crucial",
    "to navigating these challenges.",
    "Let us embrace the future",
    "with a commitment",
    "to advancing AI",
    "in ways",
    "that benefit",
    "all of humanity."
    // "Привет!",
    // "Поговорим теперь по-русски",
    // "Потрещим о том о сём",
    // "Так сказать, обкашляем вопросики"
  ]);
  const [dictatePhase, setDictatePhase] = useState<DictatePhase>(DictatePhase.Creating);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    TTS.initializeTTS();
    if (
      dictatePhase === DictatePhase.Dictating &&
      steps.length > 0 &&
      currentStepIndex < steps.length
    ) {
      TTS.speak(steps[currentStepIndex]);
    }

    if (dictatePhase === DictatePhase.MissionAccomplished) {
      TTS.speak('Mission accomplished!');
    }

    return () => {
      TTS.stop(); // Останавливаем любую озвучку
    };
  }, [currentStepIndex, dictatePhase, steps]);

  const addStep = () => {
    if (currentStep.trim() !== '') {
      setSteps(prevSteps => [...prevSteps, currentStep]);
      setCurrentStep('');
    }
  };

  const finishEditing = () => {
    if (currentStep.trim() !== '') {
      addStep();
    }
    setDictatePhase(DictatePhase.ViewingChanges);
  };

  const handleStartDictate = () => {
    setDictatePhase(DictatePhase.Dictating);
    if (steps.length > 0 && currentStepIndex === 0) {
      TTS.speak(steps[0]);
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
      TTS.speak(steps[currentStepIndex]);
    }
  };

  const handleRepeat = () => {
    if (currentStepIndex < steps.length) {
      TTS.speak(steps[currentStepIndex]); // Повторно прочитать текущий шаг
    }
  };

  const handleAbort = () => {
    setDictatePhase(DictatePhase.ViewingChanges);
  };

  const renderDictatePhase = () => {
    switch (dictatePhase) {
      case DictatePhase.Creating:
        return (
          <>
            <Text style={styles.headline}>Create your instructions:</Text>
            <TextInput
              multiline
              value={currentStep}
              onChangeText={setCurrentStep}
              style={styles.textInput}
            />
            <View style={styles.buttonContainer}>
              <Button title="That's it!" onPress={finishEditing} color="gray" />
              <Button title="+ Add Step" onPress={addStep} color="blue" />
            </View>
            <FlatList
              data={steps}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <Text style={styles.listItem}>{`${index + 1}. ${item}`}</Text>
              )}
              style={styles.list}
            />
          </>
        );

      case DictatePhase.Editing:
        return (
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.headline}>Edit your steps:</Text>
            {steps.map((step, index) => (
              <TextInput
                key={index}
                value={step}
                onChangeText={text => {
                  const newSteps = [...steps];
                  newSteps[index] = text;
                  setSteps(newSteps);
                }}
                style={styles.textInput}
              />
            ))}
            <Button
              title="Save Changes"
              onPress={() => setDictatePhase(DictatePhase.Creating)}
              color="green"
            />
          </ScrollView>
        );

      case DictatePhase.ViewingChanges:
        return (
          <>
            <Text style={styles.headline}>
              Here is your instruction. Would you like to make any changes?
            </Text>
            <FlatList
              data={steps}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <Text style={styles.listItem}>{`${index + 1}. ${item}`}</Text>
              )}
              style={styles.list}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Edit"
                onPress={() => setDictatePhase(DictatePhase.Editing)}
                color="gray"
              />
              <Button
                title="Accept"
                onPress={() => setDictatePhase(DictatePhase.ReadyToDictate)}
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
              color="blue"
            />
          </View>
        );

      case DictatePhase.Dictating:
        return (
          <View style={styles.dictatePage}>
            <Text style={styles.headline}>
              Step {currentStepIndex + 1}: {steps[currentStepIndex]}
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Back" onPress={handleBack} color="red" />
              <Button title="Repeat" onPress={handleRepeat} color="gray" />
              <Button title="Next" onPress={handleNext} color="blue" />
            </View>
            <Button title="Mission Abort" onPress={handleAbort} color="red" />
          </View>
        );

      case DictatePhase.MissionAccomplished:
        return (
          <View style={styles.dictatePage}>
            <Text style={styles.headline}>Mission Accomplished!</Text>
            <Button
              title="Begin new task"
              onPress={() => {
                setDictatePhase(DictatePhase.Creating);
                setSteps([]);
                setCurrentStepIndex(0); // Также сбрасываем индекс текущего шага
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.headline}>Dictator</Text>
      {renderDictatePhase()}
    </View>
  );
};

export default ContentView;
