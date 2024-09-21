import React from 'react';
import { TouchableOpacity, View, FlatList, Text, Button, Alert } from 'react-native';
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

const InstructionList: React.FC<InstructionListProps> = ({ instructions, onSelect, onCreate}) => {

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
            <TouchableOpacity onPress={() => onSelect(item)}>
              <Text style={styles.listItemText}>{item.title}</Text>
            </TouchableOpacity>
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
