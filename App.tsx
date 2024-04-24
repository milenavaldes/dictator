import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, ScrollView, StyleSheet } from 'react-native';

const ContentView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [editing, setEditing] = useState(true);
  const [viewingChanges, setViewingChanges] = useState(false);
  const [startDictate, setStartDictate] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Начальный индекс устанавливаем в 0
  const [isDictating, setIsDictating] = useState(false);
  

  const addStep = () => {
    if (currentStep.trim() !== '') {
      setSteps([...steps, currentStep]);
      setCurrentStep('');
    }
  };

  const finishSteps = () => {
    if (currentStep.trim() !== '') {
      addStep();
    }
    setEditing(false);
  };  

  const startDictation = () => {
    setStartDictate(true);
    setCurrentStepIndex(0); // Начинаем диктовку с первого шага
  };
  
  const handleRepeat = () => {
    // Повтор текущего шага, никаких изменений в индексе шага не нужно
  };
  
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1); // Переход к следующему шагу
    } else {
      // Если следующего шага нет, возможно, стоит сообщить пользователю или закончить диктовку
      console.log("No more steps"); // или можно вызвать handleAbort
    }
  };
  
  const handleAbort = () => {
    setStartDictate(false); // Выход из режима диктовки
    setCurrentStepIndex(0); // Сброс индекса текущего шага
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Dictator</Text>

      {editing && (
        <>
          <Text style={styles.headline}>You can add more steps here:</Text>
          <TextInput
            multiline
            value={currentStep}
            onChangeText={setCurrentStep}
            style={styles.textInput}
          />
          <Button title="That's it!" onPress={finishSteps} color="gray" />
          <Button title="+ Add Step" onPress={addStep} color="blue" />
        </>
      )}

      {!viewingChanges && !startDictate && (
        <FlatList
          data={steps}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={styles.listItem}>{`${index + 1}. ${item}`}</Text>
          )}
          style={styles.list}
        />
      )}

      {!editing && !viewingChanges && !startDictate && (
        <>
          <Text style={styles.headline}>Here is your instruction. Would you like to make any changes?</Text>
          <Button title="Edit" onPress={() => setViewingChanges(true)} color="blue" />
          <Button title="Accept version" onPress={() => setStartDictate(true)} color="gray" />
        </>
      )}

      {startDictate && (
            <View style={styles.dictatePage}>
              <Text style={styles.headline}>Step {currentStepIndex + 1}: {steps[currentStepIndex]}</Text>
              <Button title="Repeat" onPress={handleRepeat} color="blue" />
              <Button title="Next" onPress={handleNext} color="blue" />
              <Button title="Mission Abort" onPress={handleAbort} color="red" />
            </View>
          )}

      {viewingChanges && (
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
          <Button title="Save Changes" onPress={() => {
            setViewingChanges(false);
            setEditing(true);
          }} color="green" />
        </ScrollView>
      )}

      {startDictate && (
        <View style={styles.dictatePage}>
          <Text style={styles.headline}>Ready to Dictate</Text>
          <Button title="Start Dictate" onPress={() => console.log("Dictation started")} color="blue" />
        </View>
      )}



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
  }
});

export default ContentView;
