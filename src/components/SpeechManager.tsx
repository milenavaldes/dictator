import Voice from '@react-native-community/voice';

interface SpeechRecognitionResult {
  value?: string[];
  error?: any;
}

const SpeechManager = {
  isListening: false,  // Флаг для отслеживания активности распознавания речи
  isTTSActive: false,  // Флаг для отслеживания активности TTS

  initialize: (handleSpeechResults: (result: SpeechRecognitionResult) => void) => {
    Voice.onSpeechStart = () => {
      console.log('<SpeechManager> Listening started');
      SpeechManager.isListening = true;
    };

    Voice.onSpeechEnd = () => {
      console.log('<SpeechManager> Listening stopped');
      SpeechManager.isListening = false;
    };

    Voice.onSpeechError = (error: any) => {
      console.error('<SpeechManager> Speech recognition error:', error);
      SpeechManager.isListening = false;

      if (error?.error?.code === 'recognition_fail' || error?.error?.message === '203/Retry') {
        console.log('Speech recognition failed, attempting restart...');
        SpeechManager.stopRecognizing().then(() => {
          setTimeout(() => {
            SpeechManager.startRecognizing();
          }, 2000); // Увеличенная задержка для перезапуска
        }).catch((err) => {
          console.error('Error restarting recognition after failure:', err);
        });
      }
    };

    Voice.onSpeechResults = (result: SpeechRecognitionResult) => {
      console.log('<SpeechManager> onSpeechResults: ', result);
      if (result.value) {
        handleSpeechResults(result);
      }
    };

    // Пустой обработчик для предотвращения предупреждений
    Voice.onSpeechVolumeChanged = () => {};
  },

  startRecognizing: async () => {
    // Проверка: распознавание не должно запускаться, если TTS активен
    if (SpeechManager.isListening || SpeechManager.isTTSActive) {
      console.log('<SpeechManager> Speech recognition is already active or TTS is running, skipping start.');
      return;
    }

    try {
      await Voice.start('en-US'); // Запускаем распознавание речи
      SpeechManager.isListening = true;
      console.log('<SpeechManager> Started recognizing');
    } catch (e) {
      console.error('<SpeechManager> Error starting voice recognition:', e);
      SpeechManager.isListening = false;
    }
  },

  stopRecognizing: async () => {
    // Проверка: остановка только если распознавание активно
    if (!SpeechManager.isListening) {
      console.log('<SpeechManager> Speech recognition is not active, skipping stop.');
      return;
    }

    try {
      await Voice.stop(); // Останавливаем распознавание речи
      SpeechManager.isListening = false;
      console.log('<SpeechManager> Stopped recognizing');
    } catch (e) {
      console.error('<SpeechManager> Error stopping voice recognition:', e);
    }
  },

  destroy: async () => {
    try {
      await Voice.destroy(); // Полностью удаляем распознавание и его слушатели
      SpeechManager.isListening = false;
      SpeechManager.isTTSActive = false; // Сбрасываем флаг активности TTS
      console.log('<SpeechManager> Destroyed recognition');
    } catch (error) {
      console.error('<SpeechManager> Error destroying recognition:', error);
    }
  },
};

export default SpeechManager;
