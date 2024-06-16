import React from 'react';
import { View, FlatList, Text, Button } from 'react-native';
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
}

const InstructionList: React.FC<InstructionListProps> = ({ instructions, onSelect, onCreate, onDelete }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Your Instructions</Text>
      <FlatList
        data={instructions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItemContainer}>
            <Text style={styles.listItem} onPress={() => onSelect(item)}>
              {item.title}
            </Text>
            <Button title="Delete" onPress={() => onDelete(item.id)} color="red" />
          </View>
        )}
        style={styles.list}
      />
      <Button title="Create New Instruction" onPress={onCreate} />
    </View>
  );
};

export default InstructionList;
