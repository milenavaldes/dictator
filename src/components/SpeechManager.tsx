import Voice from '@react-native-community/voice';

interface SpeechRecognitionResult {
  value?: string[];
  error?: any;
}

const SpeechManager = {
  isListening: false, // Флаг для отслеживания состояния распознавания

  initialize: (handleSpeechResults: (result: SpeechRecognitionResult) => void) => {
    Voice.onSpeechStart = () => {
      console.log('<SpeechManager> Listening started');
      SpeechManager.isListening = true; // Обновляем флаг активности распознавания
    };

    Voice.onSpeechVolumeChanged = () => {
      // Пустой обработчик, чтобы предотвратить предупреждение
    };

    Voice.onSpeechEnd = () => {
      console.log('<SpeechManager> Listening stopped');
      SpeechManager.isListening = false; // Сбрасываем флаг активности при завершении
    };

    Voice.onSpeechError = (error: any) => {
      console.error('<SpeechManager> Speech recognition error:', error);
      SpeechManager.isListening = false; // Сбрасываем флаг активности при ошибке

      // Обрабатываем ошибку и перезапускаем распознавание речи при необходимости
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
  },

  startRecognizing: async () => {
    if (SpeechManager.isListening) {
      console.log('<SpeechManager> Speech recognition is already active, skipping start.');
      return; // Если распознавание уже активно, не запускаем повторно
    }

    try {
      await Voice.start('en-US'); // Запускаем распознавание речи
      SpeechManager.isListening = true; // Обновляем флаг активности после успешного старта
      console.log('<SpeechManager> Started recognizing');
    } catch (e) {
      console.error('<SpeechManager> Error starting voice recognition:', e);
      SpeechManager.isListening = false; // Сбрасываем флаг при ошибке
    }
  },

  stopRecognizing: async () => {
    if (!SpeechManager.isListening) {
      console.log('<SpeechManager> Speech recognition is not active, skipping stop.');
      return; // Если распознавание не активно, не пытаемся его остановить
    }

    try {
      await Voice.stop(); // Останавливаем распознавание речи
      SpeechManager.isListening = false; // Обновляем флаг после успешной остановки
      console.log('<SpeechManager> Stopped recognizing');
    } catch (e) {
      console.error('<SpeechManager> Error stopping voice recognition:', e);
    }
  },

  destroy: async () => {
    try {
      await Voice.destroy(); // Полностью удаляем распознавание и его слушатели
      SpeechManager.isListening = false; // Сбрасываем флаг после удаления
      console.log('<SpeechManager> Destroyed recognition');
    } catch (error) {
      console.error('<SpeechManager> Error destroying recognition:', error);
    }
  },
};

export default SpeechManager;
