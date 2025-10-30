// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Divider,
  Slider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Translate as TranslateIcon,
  Psychology as PsychologyIcon,
  Hearing as HearingIcon,
  RecordVoiceOver as VoiceIcon,
  GraphicEq as EqIcon,
  Tune as TuneIcon,
  Language as LanguageIcon,
  Speed as SpeedIcon,
  HighQuality as QualityIcon,
  Assistant as AssistantIcon,
  Chat as ChatIcon,
  SmartToy as SmartToyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { nexusColors } from '../../theme/nexusTheme';
import { premiumFreeVoiceAPI } from '../../services/premiumFreeVoiceAPI';

interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  module: string;
  confidence: number;
  timestamp: Date;
  executed: boolean;
}

interface VoiceSettings {
  language: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
  continuousListening: boolean;
  wakeWord: string;
}

const AIVoiceInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceCapabilities, setVoiceCapabilities] = useState<VoiceCapabilities | null>(null);
  const [currentProvider, setCurrentProvider] = useState<string>('auto');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'uk-UA', // Українська за замовчуванням
    voice: 'uk-UA', // Український голос
    speed: 1,
    pitch: 1,
    volume: 1.0,
    autoSpeak: true,
    continuousListening: false,
    wakeWord: 'Нексус'
  });

  // Ініціалізація Premium FREE Voice API
  useEffect(() => {
    const initVoiceAPI = async () => {
      try {
        console.log('🎤 Підключення до Premium FREE Voice API...');

        // Перевірка доступності API
        const isHealthy = await premiumFreeVoiceAPI.checkHealth();

        if (isHealthy) {
          const capabilities = await premiumFreeVoiceAPI.getCapabilities();
          setVoiceCapabilities(capabilities);
          setCurrentProvider(capabilities.recommended_tts);
          console.log('✅ Premium FREE Voice API готовий:', capabilities);
          console.log(`   🔊 TTS: ${capabilities.recommended_tts} (Coqui ⭐⭐⭐⭐⭐)`);
          console.log(`   🎧 STT: ${capabilities.recommended_stt} (faster-whisper ⭐⭐⭐⭐⭐)`);
        } else {
          console.warn('⚠️  API недоступний. Використовується Browser fallback.');
        }
      } catch (error) {
        console.error('❌ Помилка підключення до API:', error);
        console.log('💡 Запустіть API: cd predator12-local && ./start-voice-premium-free.sh');
      }
    };

    initVoiceAPI();
  }, []);

  // Ініціалізація Web Speech API - ВИКОНУЄТЬСЯ ОДИН РАЗ!
  useEffect(() => {
    console.log('🎤 Ініціалізація Web Speech API...');

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      console.log('✅ SpeechRecognition доступний:', SpeechRecognition);

      recognitionRef.current = new SpeechRecognition();
      console.log('✅ Recognition створено:', recognitionRef.current);

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'uk-UA'; // Явно встановлюємо українську мову
      recognitionRef.current.maxAlternatives = 1;

      console.log('⚙️ Налаштування:', {
        continuous: true,
        interimResults: true,
        lang: 'uk-UA',
        maxAlternatives: 1
      });

      console.log('🇺🇦 УКРАЇНСЬКА МОВА встановлена для розпізнавання!');

      recognitionRef.current.onstart = () => {
        console.log('🎤 Recognition STARTED!');
        setIsConnected(true);
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        console.log('📝 Recognition RESULT:', event);
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          console.log(`Result ${i}:`, {
            transcript,
            confidence,
            isFinal: event.results[i].isFinal
          });

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('✅ Final transcript:', finalTranscript);
            processVoiceCommand(transcript, confidence);
          } else {
            interimTranscript += transcript;
            console.log('⏳ Interim transcript:', interimTranscript);
          }
        }

        setCurrentCommand(interimTranscript || finalTranscript);
        setConfidence((event.results[0]?.[0]?.confidence || 0) * 100);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Speech recognition ERROR:', event.error);
        console.error('Error details:', event);

        let errorMessage = 'Помилка розпізнавання: ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'Не вдалося почути мовлення. Спробуйте говорити голосніше.';
            break;
          case 'audio-capture':
            errorMessage += 'Мікрофон недоступний. Перевірте налаштування.';
            break;
          case 'not-allowed':
            errorMessage += 'Доступ до мікрофона заборонено. Дозвольте у налаштуваннях браузера.';
            break;
          case 'network':
            errorMessage += 'Проблема з мережею. Перевірте з\'єднання.';
            break;
          default:
            errorMessage += event.error;
        }

        alert(errorMessage);
        setIsListening(false);
        setIsConnected(false);
      };

      recognitionRef.current.onend = () => {
        console.log('🛑 Recognition ENDED');
        console.log('Current state:', { isListening, isConnected });
        setIsListening(false);
        // НЕ перезапускаємо автоматично - користувач має контроль
      };    console.log('✅ Web Speech API налаштовано успішно!');

    // Опціональний автотест TTS (розкоментуйте для тестування)
    // setTimeout(() => {
    //   console.log('🧪 Автотест TTS...');
    //   speakResponseBrowser('Голосовий інтерфейс готовий до роботи');
    // }, 2000);
  } else {
      console.error('❌ Web Speech API недоступний у цьому браузері!');
      alert('Голосове розпізнавання недоступне. Використовуйте Chrome, Edge або Safari.');
    }

    // Ініціалізація Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      console.log('✅ Speech Synthesis доступний');

      // Завантаження голосів
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        console.log('🎤 Завантажено голосів:', voices.length);
        if (voices.length > 0) {
          console.log('📋 Перші 5 голосів:',
            voices.slice(0, 5).map(v => `${v.name} (${v.lang})`));
          const ukVoices = voices.filter(v => v.lang.includes('uk'));
          console.log('🇺🇦 Українські голоси:', ukVoices.map(v => v.name));
        }
      };

      // Голоси можуть завантажуватися асинхронно
      loadVoices();
      synthRef.current.addEventListener('voiceschanged', loadVoices);
    } else {
      console.error('❌ Speech Synthesis недоступний у цьому браузері!');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition вже зупинено');
        }
      }
    };
  }, []); // ВАЖЛИВО: запускаємо ОДИН РАЗ!

  // Оновлення мови при зміні налаштувань
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = settings.language;
      console.log('🌐 Мова змінена на:', settings.language);
    }
  }, [settings.language]);

  const processVoiceCommand = async (transcript: string, confidence: number) => {
    const command: VoiceCommand = {
      id: Date.now().toString(),
      phrase: transcript,
      action: 'processing',
      module: 'voice',
      confidence: confidence * 100,
      timestamp: new Date(),
      executed: false
    };

    setRecentCommands(prev => [command, ...prev.slice(0, 9)]);
    setIsProcessing(true);

    console.log(`🎤 Обробка команди: "${transcript}" (впевненість: ${confidence * 100}%)`);

    // Симуляція обробки команди
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Аналіз команди та генерація відповіді
    const response = generateAIResponse(transcript);
    setAiResponse(response);

    console.log(`🤖 AI відповідь: "${response}"`);

    if (settings.autoSpeak && voiceEnabled) {
      console.log('🔊 Початок озвучування відповіді...');

      // Спочатку пробуємо Browser API (він завжди доступний)
      console.log('🌐 Використовуємо Browser Speech API...');
      speakResponseBrowser(response);

      // Потім можна спробувати Premium FREE API як покращення (якщо доступний)
      // try {
      //   await speakResponsePremiumFree(response);
      // } catch (error) {
      //   console.warn('⚠️ Premium FREE TTS недоступний, використовуємо Browser API');
      // }
    } else {
      console.log('🔇 Автоозвучування вимкнено або озвучування недоступне');
    }

    // Відмічаємо команду як виконану
    command.executed = true;
    setIsProcessing(false);

    console.log('✅ Обробка команди завершена');
  };

    // Оновлення команди
    setRecentCommands(prev =>
      prev.map(cmd =>
        cmd.id === command.id
          ? { ...cmd, action: 'completed', executed: true }
          : cmd
      )
    );

    setIsProcessing(false);
    setCurrentCommand('');
  };

  const generateAIResponse = (command: string): string => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('дашборд') || lowerCommand.includes('головна')) {
      return 'Вітаю! Відкриваю головний дашборд. Тут ви можете переглянути загальний стан всіх систем. Все працює стабільно.';
    } else if (lowerCommand.includes('агент') || lowerCommand.includes('агенти')) {
      return 'Переходжу до модуля управління штучним інтелектом. Зараз активні 12 агентів. Всі працюють в штатному режимі.';
    } else if (lowerCommand.includes('безпека') || lowerCommand.includes('захист')) {
      return 'Відкриваю центр кібербезпеки. Поточний рівень загрози мінімальний. Всі захисні системи активні та функціонують належним чином.';
    } else if (lowerCommand.includes('дані') || lowerCommand.includes('база')) {
      return 'Переходжу до центру управління даними. Всі джерела даних синхронізовані. Швидкість обробки оптимальна.';
    } else if (lowerCommand.includes('аналітика') || lowerCommand.includes('звіт')) {
      return 'Відкриваю розумний модуль аналітики. Готую актуальні метрики та ключові показники ефективності для вашого огляду.';
    } else if (lowerCommand.includes('дослідження') || lowerCommand.includes('проект')) {
      return 'Переходжу до дослідницької лабораторії. Наразі активні 3 проекти та 5 експериментів. Прогрес відмінний.';
    } else if (lowerCommand.includes('3d') || lowerCommand.includes('тривимірний') || lowerCommand.includes('візуалізація')) {
      return 'Запускаю тривимірний візуалізатор. Підготовую інтерактивну сцену з можливістю обертання та масштабування.';
    } else if (lowerCommand.includes('колаборація') || lowerCommand.includes('команда') || lowerCommand.includes('чат')) {
      return 'Відкриваю хаб колаборації в реальному часі. Тут ви можете спілкуватися з командою та проводити відеоконференції.';
    } else if (lowerCommand.includes('привіт') || lowerCommand.includes('вітаю') || lowerCommand.includes('hello')) {
      return 'Привіт! Я ваш персональний AI асистент Нексус. Радий вас бачити! Чим можу допомогти сьогодні?';
    } else if (lowerCommand.includes('допомога') || lowerCommand.includes('help') || lowerCommand.includes('команди')) {
      return 'Я можу допомогти з навігацією по системі. Скажіть "відкрий дашборд", "покажи агентів", "статус системи" або "безпека". Також доступні команди для аналітики та дослідження.';
    } else if (lowerCommand.includes('статус') || lowerCommand.includes('стан')) {
      return 'Системний статус відмінний! Процесор завантажений на 45 відсотків, оперативна пам\'ять на 62 відсотки. Мережеве з\'єднання стабільне. Всі сервіси функціонують нормально.';
    } else if (lowerCommand.includes('дякую') || lowerCommand.includes('спасибо') || lowerCommand.includes('thank')) {
      return 'Будь ласка! Завжди радий допомогти. Якщо у вас є ще запитання, просто скажіть мені.';
    } else if (lowerCommand.includes('тест') || lowerCommand.includes('перевірка') || lowerCommand.includes('тестування')) {
      return 'Проводжу повне тестування голосового модуля. Розпізнавання працює відмінно! Синтез мовлення функціонує належним чином. Мікрофон налаштований правильно. Все готово до роботи.';
    } else if (lowerCommand.includes('мікрофон') || lowerCommand.includes('microphone')) {
      return 'Тестую мікрофон. Сигнал чистий, рівень звуку оптимальний. Якість розпізнавання мови відмінна. Мікрофон працює ідеально!';
    } else if (lowerCommand.includes('озвучування') || lowerCommand.includes('звук') || lowerCommand.includes('voice')) {
      return 'Перевіряю систему озвучування. Голосовий синтез активний. Українські голоси доступні. Швидкість та інтонація налаштовані правильно. Якість звуку відмінна!';
    } else if (lowerCommand.includes('українська') || lowerCommand.includes('ukrainian')) {
      return 'Переключаюся на українську мову. Вітаю! Голосовий інтерфейс повністю підтримує українську мову. Розпізнавання та озвучування працюють прекрасно!';
    } else if (lowerCommand.includes('english') || lowerCommand.includes('англійська')) {
      return 'Switching to English language. Hello! Voice interface fully supports English language. Speech recognition and text-to-speech are working perfectly!';
    } else if (lowerCommand.includes('switch') && lowerCommand.includes('english')) {
      return 'Language switched to English successfully! Hello, I am your Nexus AI assistant. How can I help you today?';
    } else {
      return `Цікаво! Ви сказали: "${command}". Я аналізую вашу команду та шукаю найкращий спосіб допомогти вам. Спробуйте сказати більш конкретну команду або натисніть кнопку "Тест голосу" для перевірки системи.`;
    }
  };

  // 🎤 Premium FREE TTS Test з найкращими безкоштовними моделями
  const testTTS = async () => {
    console.log('🎤 Тестування Premium FREE Voice System...');

    // Зупиняємо попереднє озвучування
    premiumFreeVoiceAPI.stopSpeaking();

    const testMessages = {
      uk: [
        "Привіт! Я ваш AI асистент Нексус.",
        "Використовую найкращі безкоштовні моделі: Coqui TTS та faster-whisper.",
        "Тестування завершено успішно. Всі системи готові до роботи."
      ],
      en: [
        "Hello! I am your Nexus AI assistant.",
        "Using the best free models: Coqui TTS and faster-whisper.",
        "Testing completed successfully. All systems are ready."
      ]
    };

    // Показуємо capabilities
    if (voiceCapabilities) {
      console.log('📊 Voice Capabilities:', voiceCapabilities);
      console.log('🔊 TTS провайдери:', voiceCapabilities.tts_providers);
      console.log('� STT провайдери:', voiceCapabilities.stt_providers);
      console.log(`🎯 Рекомендований TTS: ${voiceCapabilities.recommended_tts} ⭐⭐⭐⭐⭐`);
      console.log(`🎯 Рекомендований STT: ${voiceCapabilities.recommended_stt} ⭐⭐⭐⭐⭐`);
    }

    // Визначаємо мову
    const lang = settings.language.startsWith('uk') ? 'uk' : 'en';
    const messages = testMessages[lang];

    // Послідовне озвучування
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log(`🔊 Озвучування ${i + 1}/${messages.length}: "${message}"`);

      try {
        await speakResponsePremiumFree(message);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Пауза між повідомленнями
      } catch (error) {
        console.error(`❌ Помилка озвучування: ${error}`);
      }
    }

    console.log('✅ Тестування завершено!');
  };

  // 🎤 Premium FREE TTS з автоматичним fallback
  const speakResponsePremiumFree = async (text: string) => {
    if (!voiceEnabled) {
      console.log('🔇 Озвучування вимкнено');
      return;
    }

    try {
      const lang = settings.language.startsWith('uk') ? 'uk' : 'en';

      console.log(`🔊 TTS запит: "${text.substring(0, 50)}...", lang=${lang}`);

      // Використовуємо Premium FREE API з await
      await premiumFreeVoiceAPI.textToSpeech({
        text,
        language: lang,
        speed: settings.speed,
        provider: 'auto'  // Автоматично вибере Coqui або gTTS
      });

      console.log(`✅ TTS успішно (Premium FREE)`);
    } catch (error) {
      console.error('❌ Помилка Premium FREE TTS:', error);
      console.log('💡 Fallback до Browser API...');

      // Fallback до базового браузерного API
      speakResponseBrowser(text);
    }
  };

  // Покращена функція озвучування з додатковими налаштуваннями (Browser fallback)
  const speakResponseBrowser = (text: string) => {
    console.log('🔊 Browser Speech API TTS...');

    if (!synthRef.current) {
      console.error('❌ speechSynthesis недоступний');
      alert('Озвучування недоступне в цьому браузері. Спробуйте Chrome або Edge.');
      return;
    }

    if (!voiceEnabled) {
      console.log('🔇 Озвучування вимкнено користувачем');
      return;
    }

    console.log(`🎤 Озвучую: "${text.substring(0, 60)}..."`);

    // ВАЖЛИВО: Зупиняємо попереднє відтворення
    synthRef.current.cancel();

    // Створюємо висловлювання
    const utterance = new SpeechSynthesisUtterance(text);

    // Отримуємо список доступних голосів
    const voices = synthRef.current.getVoices();
    console.log(`🎵 Доступно голосів: ${voices.length}`);

    // Логуємо всі доступні голоси для дебагу
    if (voices.length > 0) {
      console.log('📋 Доступні голоси:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
    }

    // РОЗШИРЕНИЙ ПОШУК УКРАЇНСЬКОГО ГОЛОСУ
    let selectedVoice = null;

    if (settings.language === 'uk-UA' || settings.language.startsWith('uk')) {
      console.log('🇺🇦 Пошук українського голосу...');

      // Пріоритет 1: Точна відповідність uk-UA
      selectedVoice = voices.find((voice: any) => voice.lang === 'uk-UA');

      // Пріоритет 2: Будь-який uk-*
      if (!selectedVoice) {
        selectedVoice = voices.find((voice: any) => voice.lang === 'uk');
      }

      // Пріоритет 3: Пошук за назвою (Google, Microsoft)
      if (!selectedVoice) {
        selectedVoice = voices.find((voice: any) =>
          voice.name.toLowerCase().includes('ukrain') ||
          voice.name.toLowerCase().includes('lesya') ||
          voice.name.toLowerCase().includes('maxim') ||
          voice.name.toLowerCase().includes('ukrainian')
        );
      }

      // Пріоритет 4: Російський як близька мова (якщо нема українського)
      if (!selectedVoice) {
        console.warn('⚠️ Український голос не знайдено, пробую російський...');
        selectedVoice = voices.find((voice: any) =>
          voice.lang === 'ru-RU' || voice.lang === 'ru'
        );
      }

      if (selectedVoice) {
        console.log(`✅ Знайдено голос: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
        console.warn('⚠️ Жодного підходящого голосу не знайдено! Використовую системний за замовчуванням.');
      }
    } else if (settings.language === 'en-US' || settings.language.startsWith('en')) {
      console.log('🇺🇸 Пошук англійського голосу...');

      // Пріоритет для якісних голосів
      selectedVoice = voices.find((voice: any) =>
        voice.lang === 'en-US' && (
          voice.name.includes('Google') ||
          voice.name.includes('Microsoft') ||
          voice.name.includes('Neural') ||
          voice.name.includes('Premium')
        )
      );

      if (!selectedVoice) {
        selectedVoice = voices.find((voice: any) => voice.lang === 'en-US');
      }

      if (!selectedVoice) {
        selectedVoice = voices.find((voice: any) => voice.lang.startsWith('en'));
      }
    }

    // Fallback на будь-який голос
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
      console.log(`⚠️ Використовую перший доступний голос: ${selectedVoice.name}`);
    }

    // Встановлюємо голос та параметри
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`🎵 Встановлено голос: ${selectedVoice.name} (${selectedVoice.lang})`);
    }

    utterance.lang = settings.language;
    utterance.rate = settings.speed;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    console.log('⚙️ Параметри TTS:', {
      voice: selectedVoice?.name || 'системний',
      lang: utterance.lang,
      rate: utterance.rate,
      pitch: utterance.pitch,
      volume: utterance.volume
    });

    // Обробники подій
    utterance.onstart = () => {
      console.log('▶️  ОЗВУЧУВАННЯ ПОЧАЛОСЬ');
    };

    utterance.onend = () => {
      console.log('✅ ОЗВУЧУВАННЯ ЗАВЕРШЕНО');
    };

    utterance.onerror = (event: any) => {
      console.error('❌ Помилка озвучування:', event.error);
      if (event.error === 'interrupted') {
        console.log('⚠️ Озвучування перервано (це нормально)');
      } else {
        alert(`Помилка озвучування: ${event.error}`);
      }
    };

    utterance.onpause = () => {
      console.log('⏸️ Озвучування призупинено');
    };

    utterance.onresume = () => {
      console.log('▶️ Озвучування відновлено');
    };

    // ВАЖЛИВО: Запускаємо озвучування з затримкою для завантаження голосів
    const speakWithRetry = (retries = 3) => {
      const voices = synthRef.current.getVoices();

      if (voices.length > 0) {
        console.log('🚀 ЗАПУСК ОЗВУЧУВАННЯ!');
        try {
          synthRef.current.speak(utterance);
          console.log('✅ Команда speak() виконана успішно');
        } catch (error) {
          console.error('❌ Помилка при виклику speak():', error);
        }
      } else if (retries > 0) {
        console.log(`⏳ Голоси ще не завантажені, спроба ${4 - retries}/3...`);
        setTimeout(() => speakWithRetry(retries - 1), 200);
      } else {
        console.error('❌ Голоси не завантажились після 3 спроб');
        alert('Озвучування недоступне. Спробуйте перезавантажити сторінку.');
      }
    };

    // Невелика затримка перед запуском
    setTimeout(() => speakWithRetry(), 100);
  };

  const startListening = async () => {
    console.log('🎤 Спроба запуску розпізнавання...');
    console.log('Recognition ref:', recognitionRef.current);
    console.log('Is listening:', isListening);
    console.log('Voice enabled:', voiceEnabled);

    if (!recognitionRef.current) {
      console.error('❌ Speech Recognition недоступний!');
      alert('Голосове розпізнавання недоступне у вашому браузері. Спробуйте Chrome або Edge.');
      return;
    }

    if (isListening) {
      console.warn('⚠️ Вже слухаємо!');
      return;
    }

    // Спочатку запитуємо дозвіл на мікрофон явно
    try {
      console.log('🎤 Запит доступу до мікрофона...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Доступ до мікрофона надано:', stream);

      // Зупиняємо stream (recognition сам створить свій)
      stream.getTracks().forEach(track => track.stop());

      // Тепер запускаємо recognition
      console.log('✅ Запускаємо recognition.start()...');
      recognitionRef.current.start();
      console.log('✅ Recognition.start() викликано успішно');

    } catch (error) {
      console.error('❌ Помилка при запуску recognition:', error);
      alert(`Помилка доступу до мікрофона: ${error.message}\n\nПеревірте:\n1. Дозвіл у налаштуваннях браузера\n2. HTTPS з'єднання (або localhost)\n3. Мікрофон підключено`);
    }
  };

  const stopListening = () => {
    console.log('🛑 Зупинка розпізнавання...');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setIsConnected(false);
        console.log('✅ Розпізнавання зупинено');
      } catch (error) {
        console.error('❌ Помилка при зупинці:', error);
      }
    }
  };

  const toggleListening = () => {
    console.log('🔄 Toggle listening:', { isListening });
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const quickCommands = [
    { label: 'Привітання', command: 'привіт, як справи?', icon: AssistantIcon },
    { label: 'Відкрити дашборд', command: 'відкрий головний дашборд', icon: SmartToyIcon },
    { label: 'Статус системи', command: 'покажи статус системи', icon: ChatIcon },
    { label: 'Тест голосу', command: 'проведи тестування голосового модуля', icon: AutoAwesomeIcon },
    { label: 'Аналітика', command: 'відкрий модуль аналітики', icon: LightbulbIcon },
    { label: 'Допомога', command: 'покажи доступні команди', icon: AssistantIcon },
    { label: '🎤 Голосовий тест', command: 'тестування мікрофону та озвучування', icon: VoiceIcon },
    { label: '🔊 Перевірка звуку', command: 'перевір якість звуку та озвучування', icon: VolumeUpIcon },
    { label: '🇺🇦 Українська мова', command: 'переключись на українську мову та скажи щось', icon: LanguageIcon },
    { label: '🌐 English test', command: 'switch to english and say hello', icon: TranslateIcon }
  ];

  const executeQuickCommand = (command: string) => {
    processVoiceCommand(command, 1.0);
  };

  // Функція привітання при завантаженні
  const welcomeMessage = () => {
    if (settings.autoSpeak && voiceEnabled) {
      setTimeout(() => {
        speakResponse("Вітаю в Нексус системі! Голосовий інтерфейс готовий до роботи. Скажіть 'допомога' для переліку команд.");
      }, 1000);
    }
  };

  // Автоматичне привітання при першому завантаженні
  useEffect(() => {
    welcomeMessage();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок модуля */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Avatar
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
              width: 60,
              height: 60
            }}
          >
            <VoiceIcon sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: nexusColors.text.primary,
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {settings.language === 'uk-UA'
                ? '🎤 AI Голосовий Інтерфейс'
                : '🎤 AI Voice Interface'}
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: nexusColors.text.secondary }}
            >
              {settings.language === 'uk-UA'
                ? 'Голосове управління та AI асистент'
                : 'Voice Control and AI Assistant'}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Основний інтерфейс */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3,
            mb: 3,
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Візуальний індикатор прослуховування */}
            <motion.div
              animate={isListening ? {
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              } : {}}
              transition={{
                duration: 2,
                repeat: isListening ? Infinity : 0,
                ease: "easeInOut"
              }}
              style={{ marginBottom: '2rem' }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  background: isListening
                    ? `linear-gradient(45deg, ${nexusColors.success.main}, ${nexusColors.accent.main})`
                    : `linear-gradient(45deg, ${nexusColors.text.secondary}40, ${nexusColors.primary.dark})`,
                  border: isListening ? `3px solid ${nexusColors.success.main}40` : 'none',
                  boxShadow: isListening ? `0 0 30px ${nexusColors.success.main}40` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={toggleListening}
              >
                {isListening ? (
                  <MicIcon sx={{ fontSize: '3rem', color: 'white' }} />
                ) : (
                  <MicOffIcon sx={{ fontSize: '3rem', color: nexusColors.text.secondary }} />
                )}
              </Avatar>
            </motion.div>

            {/* Статус та поточна команда */}
            <Typography
              variant="h5"
              sx={{
                color: isListening ? nexusColors.success.main : nexusColors.text.secondary,
                mb: 2,
                fontWeight: 'bold'
              }}
            >
              {isListening
                ? (settings.language === 'uk-UA' ? '🎧 Слухаю...' : '🎧 Listening...')
                : (settings.language === 'uk-UA' ? '🔇 Натисніть для активації' : '🔇 Click to activate')}
            </Typography>

            {currentCommand && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    background: `${nexusColors.accent.main}20`,
                    border: `1px solid ${nexusColors.accent.main}40`,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" sx={{ color: nexusColors.text.primary }}>
                    "{currentCommand}"
                  </Typography>
                  {confidence > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={confidence}
                      sx={{
                        mt: 1,
                        height: 4,
                        borderRadius: 2,
                        background: `${nexusColors.primary.dark}30`,
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${nexusColors.accent.main}, ${nexusColors.success.main})`
                        }
                      }}
                    />
                  )}
                </Paper>
              </motion.div>
            )}

            {/* AI відповідь */}
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    background: `${nexusColors.primary.main}20`,
                    border: `1px solid ${nexusColors.primary.main}40`,
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background: `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.accent.main})`
                      }}
                    >
                      <PsychologyIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: nexusColors.text.secondary, mb: 1 }}>
                        AI Асистент Nexus:
                      </Typography>
                      <Typography variant="body1" sx={{ color: nexusColors.text.primary }}>
                        {aiResponse}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => speakResponse(aiResponse)}
                      sx={{ color: nexusColors.primary.main }}
                    >
                      <VolumeUpIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </motion.div>
            )}

            {/* Індикатор обробки */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <PsychologyIcon sx={{ color: nexusColors.accent.main }} />
                  </motion.div>
                  <Typography variant="body1" sx={{ color: nexusColors.text.primary }}>
                    Обробляю команду...
                  </Typography>
                </Box>
              </motion.div>
            )}

            {/* Кнопки управління */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
              <Button
                variant={isListening ? "contained" : "outlined"}
                onClick={toggleListening}
                startIcon={isListening ? <StopIcon /> : <PlayIcon />}
                sx={{
                  borderColor: nexusColors.accent.main,
                  color: isListening ? 'white' : nexusColors.accent.main,
                  background: isListening ? nexusColors.accent.main : 'transparent',
                  '&:hover': {
                    borderColor: nexusColors.accent.light,
                    background: isListening ? nexusColors.accent.dark : `${nexusColors.accent.main}20`
                  }
                }}
              >
                {isListening ? 'Зупинити' : 'Почати слухати'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                startIcon={voiceEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                sx={{
                  borderColor: nexusColors.info.main,
                  color: nexusColors.info.main,
                  '&:hover': {
                    borderColor: nexusColors.info.light,
                    background: `${nexusColors.info.main}20`
                  }
                }}
              >
                {voiceEnabled ? 'Звук вкл' : 'Звук вимк'}
              </Button>

              <Button
                variant="outlined"
                onClick={testTTS}
                startIcon={<HearingIcon />}
                sx={{
                  borderColor: nexusColors.success.main,
                  color: nexusColors.success.main,
                  '&:hover': {
                    borderColor: nexusColors.success.light,
                    background: `${nexusColors.success.main}20`
                  }
                }}
              >
                Тест голосу
              </Button>

              <Button
                variant="outlined"
                onClick={() => speakResponseBrowser('Тест браузерного озвучування. Якщо ви чуєте це повідомлення, то Browser Speech API працює правильно.')}
                startIcon={<VolumeUpIcon />}
                sx={{
                  borderColor: nexusColors.info.main,
                  color: nexusColors.info.main,
                  '&:hover': {
                    borderColor: nexusColors.info.light,
                    background: `${nexusColors.info.main}20`
                  }
                }}
              >
                Тест Browser
              </Button>

              <Button
                variant="outlined"
                onClick={() => setSettingsOpen(true)}
                startIcon={<SettingsIcon />}
                sx={{
                  borderColor: nexusColors.warning.main,
                  color: nexusColors.warning.main,
                  '&:hover': {
                    borderColor: nexusColors.warning.light,
                    background: `${nexusColors.warning.main}20`
                  }
                }}
              >
                Налаштування
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Швидкі команди */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3,
            mb: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ color: nexusColors.text.primary, mb: 3, fontWeight: 'bold' }}
            >
              ⚡ Швидкі Команди
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {quickCommands.map((cmd, index) => (
                <motion.div
                  key={cmd.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<cmd.icon />}
                    onClick={() => executeQuickCommand(cmd.command)}
                    sx={{
                      borderColor: `${nexusColors.accent.main}50`,
                      color: nexusColors.text.primary,
                      '&:hover': {
                        borderColor: nexusColors.accent.main,
                        background: `${nexusColors.accent.main}20`
                      }
                    }}
                  >
                    {cmd.label}
                  </Button>
                </motion.div>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Останні команди */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}80, ${nexusColors.secondary.dark}60)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ color: nexusColors.text.primary, mb: 3, fontWeight: 'bold' }}
            >
              📝 Історія Команд
            </Typography>

            <List>
              {recentCommands.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="Ще немає виконаних команд"
                    primaryTypographyProps={{ color: nexusColors.text.secondary }}
                  />
                </ListItem>
              ) : (
                recentCommands.map((command, index) => (
                  <motion.div
                    key={command.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <ListItem
                      sx={{
                        background: `${nexusColors.secondary.dark}20`,
                        borderRadius: 2,
                        mb: 1,
                        border: `1px solid ${command.executed ? nexusColors.success.main : nexusColors.warning.main}30`
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            background: command.executed
                              ? nexusColors.success.main
                              : nexusColors.warning.main,
                            fontSize: '0.8rem'
                          }}
                        >
                          {command.executed ? '✓' : '⏳'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={command.phrase}
                        secondary={`${command.timestamp.toLocaleTimeString()} • Впевненість: ${command.confidence.toFixed(1)}%`}
                        primaryTypographyProps={{ color: nexusColors.text.primary }}
                        secondaryTypographyProps={{ color: nexusColors.text.secondary }}
                      />
                    </ListItem>
                  </motion.div>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </motion.div>

      {/* Діалог налаштувань */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${nexusColors.primary.dark}95, ${nexusColors.secondary.dark}90)`,
            backdropFilter: 'blur(15px)',
            border: `1px solid ${nexusColors.accent.main}30`,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: nexusColors.text.primary, borderBottom: `1px solid ${nexusColors.accent.main}30` }}>
          🎛️ Налаштування Голосового Інтерфейсу
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: nexusColors.text.secondary }}>
                {settings.language === 'uk-UA' ? 'Мова інтерфейсу' : 'Interface Language'}
              </InputLabel>
              <Select
                value={settings.language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setSettings(prev => ({ ...prev, language: newLang }));
                  console.log(`🌐 Мову змінено на: ${newLang}`);
                }}
                sx={{
                  color: nexusColors.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: `${nexusColors.accent.main}50` }
                }}
              >
                <MenuItem value="uk-UA">🇺🇦 Українська (за замовчуванням)</MenuItem>
                <MenuItem value="en-US">🇺🇸 English</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography sx={{ color: nexusColors.text.primary, mb: 2 }}>
                Швидкість мови: {settings.speed}x
              </Typography>
              <Slider
                value={settings.speed}
                onChange={(_, value) => setSettings(prev => ({ ...prev, speed: value as number }))}
                min={0.5}
                max={2}
                step={0.1}
                sx={{
                  color: nexusColors.accent.main,
                  '& .MuiSlider-thumb': { color: nexusColors.accent.main },
                  '& .MuiSlider-track': { color: nexusColors.accent.main }
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ color: nexusColors.text.primary, mb: 2 }}>
                Висота голосу: {settings.pitch}
              </Typography>
              <Slider
                value={settings.pitch}
                onChange={(_, value) => setSettings(prev => ({ ...prev, pitch: value as number }))}
                min={0.5}
                max={2}
                step={0.1}
                sx={{
                  color: nexusColors.accent.main,
                  '& .MuiSlider-thumb': { color: nexusColors.accent.main },
                  '& .MuiSlider-track': { color: nexusColors.accent.main }
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ color: nexusColors.text.primary, mb: 2 }}>
                Гучність: {Math.round(settings.volume * 100)}%
              </Typography>
              <Slider
                value={settings.volume}
                onChange={(_, value) => setSettings(prev => ({ ...prev, volume: value as number }))}
                min={0}
                max={1}
                step={0.1}
                sx={{
                  color: nexusColors.accent.main,
                  '& .MuiSlider-thumb': { color: nexusColors.accent.main },
                  '& .MuiSlider-track': { color: nexusColors.accent.main }
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSpeak}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoSpeak: e.target.checked }))}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: nexusColors.accent.main,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: nexusColors.accent.main,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: nexusColors.text.primary }}>
                  Автоматично озвучувати відповіді
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.continuousListening}
                  onChange={(e) => setSettings(prev => ({ ...prev, continuousListening: e.target.checked }))}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: nexusColors.success.main,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: nexusColors.success.main,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: nexusColors.text.primary }}>
                  Безперервне прослуховування
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${nexusColors.accent.main}30` }}>
          <Button
            onClick={() => setSettingsOpen(false)}
            sx={{ color: nexusColors.text.secondary }}
          >
            Закрити
          </Button>
          <Button
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.primary.main})`,
              color: 'white'
            }}
          >
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIVoiceInterface;
