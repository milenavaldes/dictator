import Voice from '@react-native-community/voice';

interface SpeechResult {
  value?: string[];
  error?: any;
}

const SpeechManager = {
  initialize: () => {
    Voice.onSpeechStart = () => console.log('Listening started');
    Voice.onSpeechEnd = () => console.log('Listening stopped');
    Voice.onSpeechError = (error) => console.error('Speech recognition error:', error);
  },

  destroy: () => {
    Voice.destroy().then(Voice.removeAllListeners);
  },

  startRecognizing: async () => {
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error('Error starting voice recognition:', e);
    }
  },

  onSpeechResults: (callback: (result: SpeechResult) => void) => {
    Voice.onSpeechResults = (result) => {
      console.log('onSpeechResults: ', result);
      callback(result);
    };
  },

  stopRecognizing: async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Error stopping voice recognition:', e);
    }
  }
};

export default SpeechManager;
