import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import TTS from '../utils/useTTS';
import Tts from 'react-native-tts';
import styles from '../utils/styles';
import InstructionList from './InstructionList';
import InstructionEditor from './InstructionEditor';
import { loadInstructions, saveInstruction, deleteInstruction } from '../utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

enum DictatePhase {
  ViewingChanges = 'ViewingChanges',
  Creating = 'Creating',
  Editing = 'Editing',
  ReadyToDictate = 'ReadyToDictate',
  Dictating = 'Dictating',
  MissionAccomplished = 'MissionAccomplished',
}

interface Step {
  text: string;
  duration?: number | null; // Optional duration in seconds
}

interface Instruction {
  id: string;
  title: string;
  steps: Step[];
}

const ContentView: React.FC = () => {
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [dictatePhase, setDictatePhase] = useState<DictatePhase>(DictatePhase.ViewingChanges);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    TTS.initializeTTS('en-US');

    const onTTSFinish = () => {
      console.log('TTS finished');
    };

    const onTTSStart = () => {
      console.log('TTS started');
    };

    Tts.addEventListener('tts-finish', onTTSFinish);
    Tts.addEventListener('tts-start', onTTSStart);

    return () => {
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-start');
    };
  }, []);

  useEffect(() => {
    const fetchInstructions = async () => {
      const loadedInstructions = await loadInstructions();
      setInstructions(loadedInstructions);
    };
    fetchInstructions();
  }, []);

  const handleSaveInstruction = async (instruction: Instruction) => {
    await saveInstruction(instruction);
    const updatedInstructions = await loadInstructions();
    setInstructions(updatedInstructions);
    setSelectedInstruction(instruction);
    setSteps(instruction.steps);
    setDictatePhase(DictatePhase.ViewingChanges);
  };

  const handleDeleteInstruction = async (id: string) => {
    await deleteInstruction(id);
    setInstructions(await loadInstructions());
  };

  const handleSelectInstruction = (instruction: Instruction) => {
    setSelectedInstruction(instruction);
    setSteps(instruction.steps);
    setDictatePhase(DictatePhase.ViewingChanges);
  };

  const handleEditInstruction = () => {
    setDictatePhase(DictatePhase.Editing);
  };

  const handleCreateInstruction = () => {
    setSelectedInstruction(null);
    setSteps([]);
    setDictatePhase(DictatePhase.Creating);
  };

  const renderDictatePhase = () => {
    switch (dictatePhase) {
      case DictatePhase.Creating:
        return (
          <InstructionEditor
            instruction={selectedInstruction}
            onSave={handleSaveInstruction}
            onDiscard={() => setDictatePhase(DictatePhase.ViewingChanges)}
          />
        );
      case DictatePhase.Editing:
        return (
          <InstructionEditor
            instruction={selectedInstruction}
            onSave={handleSaveInstruction}
            onDiscard={() => setDictatePhase(DictatePhase.ViewingChanges)}
          />
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
                <Text style={styles.listItem}>{`${index + 1}. ${item.text} ${item.duration ? `(Duration: ${item.duration} s)` : ''}`}</Text>
              )}
              style={styles.list}
            />
            <View style={styles.buttonContainer}>
              <Button title="Edit" onPress={handleEditInstruction} color="gray" />
              <Button
                title="Accept"
                onPress={() => setDictatePhase(DictatePhase.ReadyToDictate)}
                color="blue"
              />
            </View>
          </>
        );
      default:
        return (
          <InstructionList
            instructions={instructions}
            onSelect={handleSelectInstruction}
            onCreate={handleCreateInstruction}
            onDelete={handleDeleteInstruction}
          />
        );
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {renderDictatePhase()}
    </View>
  );
};

export default ContentView;
