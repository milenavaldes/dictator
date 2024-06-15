import Tts from 'react-native-tts';

const initializeTTS = (language = 'en-US') => {
  Tts.setDefaultLanguage(language);
  Tts.setDefaultRate(0.6); //0.6
  Tts.setDefaultPitch(1.0); //1
};

const speak = (text: string) => {
  Tts.speak(text);
};

const stop = () => {
  Tts.stop();
};

export default {
  initializeTTS,
  speak,
  stop,
};
