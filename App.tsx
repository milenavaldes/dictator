import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.headline}>Create your instruction step by step</Text>

      {editing && (
        <>
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

      <FlatList
        data={steps}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.listItem}>{`${index + 1}. ${item}`}</Text>
        )}
        style={styles.list}
      />

{viewingChanges && (
  <View>
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
  </View>
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
          <Button title="Save Changes" onPress={() => {
            setViewingChanges(false);
            setEditing(true);
          }} color="green" />
        </>
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
    flexGrow: 0, // Ensures the list does not interfere with other layout components
    marginBottom: 20,
  },
  listItem: {
    fontSize: 16,
    padding: 10,
  },
});

export default ContentView;
