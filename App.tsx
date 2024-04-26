import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, ScrollView, StyleSheet } from 'react-native';

const DictatePhase = {
  Editing: 'Editing',
  ViewingChanges: 'ViewingChanges',
  ReadyToDictate: 'ReadyToDictate',
  Dictating: 'Dictating',
  MissionAccomplished: 'MissionAccomplished',
};

const ContentView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [dictatePhase, setDictatePhase] = useState(DictatePhase.Editing);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStepIndex(nextIndex);
    } else {
      setDictatePhase(DictatePhase.MissionAccomplished);
    }
  };

  const handleRepeat = () => {
    // Логика для повторения текущего шага
  };

  const handleAbort = () => {
    setDictatePhase(DictatePhase.ReadyToDictate);
    setCurrentStepIndex(0);
  };

  const renderDictatePhase = () => {
    switch (dictatePhase) {
      case DictatePhase.Editing:
      return (
        <>
          <Text style={styles.headline}>You can add more steps here:</Text>
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
  
      case DictatePhase.ViewingChanges:
      return (
        <>
          <Text style={styles.headline}>Here is your instruction. Would you like to make any changes?</Text>
          <FlatList
            data={steps}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Text style={styles.listItem}>{`${index + 1}. ${item}`}</Text>
            )}
            style={styles.list}
          />
          
          <View style={styles.buttonContainer}>
            <Button title="Edit" onPress={() => setDictatePhase(DictatePhase.Editing)} color="blue" />
            <Button title="Accept version" onPress={() => setDictatePhase(DictatePhase.ReadyToDictate)} color="gray" />
          </View>
        </>
      );
  
      case DictatePhase.ReadyToDictate:
        return (
          <View style={styles.dictatePage}>
            <Text style={styles.headline}>Ready to Dictate</Text>
            <Button title="Start Dictate" onPress={handleStartDictate} color="blue" />
          </View>
        );

      case DictatePhase.Dictating:
        return (
          <View style={styles.dictatePage}>
            <Text style={styles.headline}>Step {currentStepIndex + 1}: {steps[currentStepIndex]}</Text>
            <Button title="Repeat" onPress={handleRepeat} color="blue" />
            <Button title="Next" onPress={handleNext} color="blue" />
            <Button title="Mission Abort" onPress={handleAbort} color="red" />
          </View>
        );

      case DictatePhase.MissionAccomplished:
        return (
          <View style={styles.dictatePage}>
            <Text style={styles.headline}>Mission Accomplished!</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Dictator</Text>
      {renderDictatePhase()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'grey',
    marginBottom: 20,
    padding: 10,
  },
  list: {
    flexGrow: 0,
    marginBottom: 20,
  },
  listItem: {
    fontSize: 16,
    padding: 10,
  },
  scrollContainer: {
  },
  dictatePage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Распределяет кнопки равномерно
    marginBottom: 20,
  }
});

export default ContentView;
