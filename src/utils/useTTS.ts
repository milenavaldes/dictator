import Tts from 'react-native-tts';

const initializeTTS = (language: string = 'en-US') => {
  Tts.setDefaultLanguage(language);
  Tts.setDefaultRate(0.6);
  Tts.setDefaultPitch(1.0);
};

const setLanguage = (language: string) => {
  Tts.setDefaultLanguage(language);
};

const speak = (text: string) => {
  Tts.speak(text);
};

const stop = () => {
  Tts.stop();
};

export default {
  initializeTTS,
  setLanguage,
  speak,
  stop,
};
