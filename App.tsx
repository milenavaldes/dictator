import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

const ContentView: React.FC = () => {
  const [currentStep, setCurrentStep] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [editing, setEditing] = useState(true);
  const [viewingChanges, setViewingChanges] = useState(false);

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headline}>Create your instruction step by step</Text>
      {editing && (
        <>
          <TextInput
            multiline
            value={currentStep}
            onChangeText={setCurrentStep}
            style={styles.textInput}
          />
          <View style={styles.buttonRow}>
            <Button title="That's it!" onPress={finishSteps} color="gray" />
            <Button title="+ Add Step" onPress={addStep} color="blue" />
          </View>
        </>
      )}

      {!editing && !viewingChanges && (
        <>
          <Text style={styles.headline}>Here is your instruction. Would you like to make any changes?</Text>
          <Button title="Edit" onPress={() => setViewingChanges(true)} color="blue" />
          <Button title="Confirm" onPress={() => console.log('Confirm Steps')} color="gray" />
        </>
      )}

      {viewingChanges && (
        <>
          {steps.map((step, index) => (
            <TextInput
              key={index}
              value={step}
              onChangeText={(text) => {
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
        </>
      )}
    </ScrollView>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ContentView;
