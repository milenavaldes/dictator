import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTRUCTIONS_KEY = '@instructions';

export const saveInstruction = async (instruction) => {
  try {
    const instructions = await loadInstructions();
    const index = instructions.findIndex(inst => inst.id === instruction.id);
    if (index !== -1) {
      instructions[index] = instruction;
    } else {
      instructions.push(instruction);
    }
    await AsyncStorage.setItem(INSTRUCTIONS_KEY, JSON.stringify(instructions));
  } catch (e) {
    console.error('Failed to save instruction:', e);
  }
};

export const loadInstructions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(INSTRUCTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load instructions:', e);
    return [];
  }
};

export const deleteInstruction = async (id) => {
  try {
    const instructions = await loadInstructions();
    const filteredInstructions = instructions.filter(inst => inst.id !== id);
    await AsyncStorage.setItem(INSTRUCTIONS_KEY, JSON.stringify(filteredInstructions));
  } catch (e) {
    console.error('Failed to delete instruction:', e);
  }
};
