import Tts from 'react-native-tts';

type TtsEvents = 'tts-start' | 'tts-finish' | 'tts-progress';

const initializeTTS = (language: string = 'en-US') => {
  Tts.setDefaultLanguage(language);
  Tts.setDefaultRate(0.5);
  Tts.setDefaultPitch(1.0);
};

const addListener = (event: TtsEvents, handler: () => void) => {
  Tts.addListener(event, handler); // Используем addListener
};

const removeAllListeners = () => {
  Tts.removeAllListeners('tts-start');
  Tts.removeAllListeners('tts-finish');
  Tts.removeAllListeners('tts-progress');
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
  removeAllListeners,
  speak,
  stop,
};

