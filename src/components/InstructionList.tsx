import React from 'react';
import { View, FlatList, Text, Button, Alert } from 'react-native';
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

interface InstructionListProps {
  instructions: Instruction[];
  onSelect: (instruction: Instruction) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onStart: (instruction: Instruction) => void;
}

const InstructionList: React.FC<InstructionListProps> = ({ instructions, onSelect, onCreate, onDelete, onStart }) => {

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
          onPress: () => onDelete(id),
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.headline}>Your Instructions</Text>
      </View>
      <FlatList
        data={instructions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.title}</Text>
            <View style={styles.listInstructionButtonContainer}>
            <Button title="Delete" onPress={() => confirmDeleteInstruction(item.id)} color="red" />
            <Button title="Edit" onPress={() => onSelect(item)} />
            <Button title="Start" onPress={() => onStart(item)} color="green" />
            </View>
          </View>
        )}
        style={styles.list}
      />
      <View style={styles.createInstructionButton}>
      <Button title="Create New Instruction" onPress={onCreate} />
      </View>
    </View>
  );
};

export default InstructionList;
