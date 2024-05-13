import Tts from 'react-native-tts';

const initializeTTS = () => {
  Tts.setDefaultLanguage('en-US');
  Tts.setDefaultRate(0.5);
  Tts.setDefaultPitch(1.0);

  Tts.addEventListener('tts-start', event => console.log('start', event));
  Tts.addEventListener('tts-finish', event => console.log('finish', event));
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
