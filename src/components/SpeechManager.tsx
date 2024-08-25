import Voice from '@react-native-community/voice';

interface SpeechRecognitionResult {
  value?: string[];
  error?: any;
}

const SpeechManager = {
    initialize: (handleSpeechResults: (result: SpeechRecognitionResult) => void) => {
    Voice.onSpeechStart = () => {
      console.log('<SpeechManager> Listening started');
    };
    Voice.onSpeechEnd = () => console.log('<SpeechManager> Listening stopped');
    Voice.onSpeechError = (error: any) => console.error('<SpeechManager> Speech recognition error:', error);
    Voice.onSpeechResults = (result: SpeechRecognitionResult) => {
        console.log('<SpeechManager> onSpeechResults: ', result);
      if (result.value) {
        handleSpeechResults(result);
      }
    };
  },

  destroy: async () => {
    Voice.destroy().then(Voice.removeAllListeners);
  },

  startRecognizing: async () => {
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error('<SpeechManager> Error starting voice recognition:', e);
    }
  },

  stopRecognizing: async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('<SpeechManager> Error stopping voice recognition:', e);
    }
  }
};

export default SpeechManager;