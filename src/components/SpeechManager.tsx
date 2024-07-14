import Voice from '@react-native-voice/voice';

interface SpeechResult {
  value?: string[];
  error?: any;
}

const SpeechManager = {
  startRecognizing: async (): Promise<void> => {
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error('Error starting voice recognition:', e);
    }
  },

  onSpeechResults: (callback: (result: SpeechResult) => void): void => {
    Voice.onSpeechResults = (e: SpeechResult) => {
      console.log('onSpeechResults: ', e);
      callback(e);
    };
  },

  stopRecognizing: async (): Promise<void> => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Error stopping voice recognition:', e);
    }
  }
};

export default SpeechManager;
