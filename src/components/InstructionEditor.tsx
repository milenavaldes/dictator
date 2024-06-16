import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import uuid from 'react-native-uuid';
import styles from '../utils/styles';

interface Step {
  text: string;
  duration?: number | null;
}

interface Instruction {
  id: string;
  title: string;
  steps: Step[];
}

interface InstructionEditorProps {
  instruction: Instruction | null;
  onSave: (instruction: Instruction) => void;
  onDiscard: () => void;
}

const InstructionEditor: React.FC<InstructionEditorProps> = ({ instruction, onSave, onDiscard }) => {
  const [title, setTitle] = useState(instruction?.title || '');
  const [steps, setSteps] = useState<Step[]>(instruction?.steps || []);
  const [currentStep, setCurrentStep] = useState('');

  const parseStep = (stepText: string): Step => {
    const match = stepText.match(/\((\d+)\)$/);
    const duration = match ? parseInt(match[1], 10) : null;
    const text = match ? stepText.replace(/\s*\(\d+\)$/, '') : stepText;
    return { text: text.trim(), duration };
  };

  const handleChangeText = (text: string) => {
    setCurrentStep(text);
    const newSteps = text.split('\n').map(line => parseStep(line.trim())).filter(step => step.text.length > 0);
    setSteps(newSteps);
  };

  const handleSave = () => {
    const newInstruction: Instruction = {
      id: instruction?.id || uuid.v4().toString(),
      title,
      steps,
    };
    onSave(newInstruction);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.textInput}
      />
      <TextInput
        multiline
        placeholder="Enter steps, each on a new line"
        value={currentStep}
        onChangeText={handleChangeText}
        style={styles.textInput}
      />
      <FlatList
        data={steps}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.listItem}>{`${index + 1}. ${item.text} ${item.duration ? `(Duration: ${item.duration} s)` : ''}`}</Text>
        )}
        style={styles.list}
      />
      <Button title="Save Instruction" onPress={handleSave} />
      <Button title="Discard changes" onPress={onDiscard} color="red" />
    </View>
  );
};

export default InstructionEditor;
