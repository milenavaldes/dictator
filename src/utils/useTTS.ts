import Tts from 'react-native-tts';

type TtsEvents = 'tts-start' | 'tts-finish' | 'tts-progress';

const initializeTTS = (language: string = 'en-US') => {
  Tts.setDefaultLanguage(language);
  Tts.setDefaultRate(0.5);
  Tts.setDefaultPitch(1.0);
};

const addListener = (event: TtsEvents, handler: () => void) => {
  Tts.addEventListener(event, handler);
};

const removeListener = (event: TtsEvents, handler: () => void) => {
  Tts.removeEventListener(event, handler);
};

const speak = (text: string) => {
  Tts.speak(text);
};

const stop = () => {
  Tts.stop();
};

export default {
  initializeTTS,
  addListener,
  removeListener,
  speak,
  stop,
};
