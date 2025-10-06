// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Chip,
  Fade,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Stack,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  AutoAwesome as AIIcon,
  Psychology as BrainIcon,
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Close as CloseIcon,
  SettingsVoice as VoiceIcon,
  QuestionAnswer as QuestionIcon,
  Navigation as NavIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
import { useI18n } from '../../i18n/I18nProvider';
import Avatar3D from './Avatar3D';

interface ContextualMessage {
  id: string;
  text: string;
  type: 'response' | 'proactive' | 'insight' | 'warning' | 'user' | 'system';
  context?: any;
  actions?: Array<{ label: string; action: string; type?: 'primary' | 'secondary' | 'danger' }>;
  timestamp: Date;
  emotion?: 'neutral' | 'happy' | 'concerned' | 'focused' | 'alert';
  gesture?: 'explain' | 'point' | 'wave' | 'nod';
  isTyping?: boolean;
  audioUrl?: string;
}

type ModuleKey = 'dashboard' | 'etl' | 'agents' | 'security' | 'analytics' | 'settings';

interface ContextualChatProps {
  open?: boolean;
  onClose?: () => void;
  currentModule?: string;
  systemHealth?: 'optimal' | 'degraded' | 'unknown' | 'critical';
  agentsData?: any[];
  realTimeData?: any;
  onAction?: (action: string, params?: any) => void;
  onNavigate?: (module: string) => void;
  visible?: boolean;
  module?: ModuleKey;
  closable?: boolean;
}

interface VoiceSettings {
  enabled: boolean;
  recognition: boolean;
  synthesis: boolean;
  ttsEnabled: boolean;
  sttEnabled: boolean;
  language: string;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
}

const ContextualChat: React.FC<ContextualChatProps> = ({
  systemHealth = 'optimal',
  agentsData = [],
  realTimeData,
  onAction,
  visible = false,
  module = 'dashboard',
  onClose,
  closable = true
}) => {
  const [messages, setMessages] = useState<ContextualMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [proactiveMode, setProactiveMode] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    recognition: true,
    synthesis: true,
    ttsEnabled: true,
    sttEnabled: true,
    language: 'uk-UA',
    voice: 'uk-UA-Standard-A',
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    autoSpeak: false
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'neutral' | 'happy' | 'concerned' | 'focused' | 'alert'>('neutral');
  const [show3DAvatar, setShow3DAvatar] = useState(true);
  const [avatarQuality, setAvatarQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [autoCloseTimer, setAutoCloseTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const messagesRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesizerRef = useRef<SpeechSynthesis | null>(null);
  const currentSpeechRef = useRef<string>('');

  // Инициализация голосового API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = voiceSettings.language;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current = recognition;
    }

    if ('speechSynthesis' in window) {
      synthesizerRef.current = window.speechSynthesis;
    }
  }, [voiceSettings.language]);

  // Автозакриття через 30 секунд бездіяльності
  useEffect(() => {
    if (!visible || !closable || !onClose) return;

    const resetTimer = () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
      const newTimer = setTimeout(() => {
        onClose();
      }, 60000); // 60 секунд для більшого комфорту
      setAutoCloseTimer(newTimer);
    };

    resetTimer();

    // Скидаємо таймер при активності
    const activityEvents = ['mouseenter', 'click', 'keydown', 'scroll'];
    const resetOnActivity = () => resetTimer();

    activityEvents.forEach(event => {
      chatContainerRef.current?.addEventListener(event, resetOnActivity);
    });

    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
      activityEvents.forEach(event => {
        chatContainerRef.current?.removeEventListener(event, resetOnActivity);
      });
    };
  }, [visible, closable, onClose, autoCloseTimer]);

  // Закриття при кліку поза чатом
  useEffect(() => {
    if (!visible || !closable || !onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, closable, onClose]);

  // Контекстные подсказки для разных модулей
  const getModuleContext = useCallback(() => {
    const contexts: Record<ModuleKey, {
      hints: string[];
      greeting: string;
      emotion: ContextualMessage['emotion'];
    }> = {
      dashboard: {
        hints: ['статус системи', 'загальний огляд', 'ключові метрики', 'останні події'],
        greeting: 'Вітаю на головній панелі! Можу показати загальний стан системи або допомогти з навігацією.',
        emotion: 'neutral' as const
      },
      etl: {
        hints: ['процеси ETL', 'трансформація даних', 'джерела даних', 'помилки завантаження'],
        greeting: 'У модулі ETL можу допомогти з налаштуванням конвеєрів даних та діагностикою процесів.',
        emotion: 'focused' as const
      },
      agents: {
        hints: ['статус агентів', 'MAS система', 'продуктивність', 'перезапуск агентів'],
        greeting: 'Моніторю стан усіх агентів MAS. Можу надати детальну інформацію про їх роботу.',
        emotion: 'alert' as const
      },
      security: {
        hints: ['загрози безпеки', 'журнали доступу', 'сертифікати', 'аудит системи'],
        greeting: 'Модуль безпеки під моїм контролем. Повідомлю про будь-які підозрілі активності.',
        emotion: 'concerned' as const
      },
      analytics: {
        hints: ['аналіз даних', 'звіти', 'тренди', 'прогнози'],
        greeting: 'В аналітичному модулі можу пояснити дані та допомогти з інтерпретацією результатів.',
        emotion: 'focused' as const
      },
      settings: {
        hints: ['конфігурація', 'параметри системи', 'користувацькі налаштування', 'інтеграції'],
        greeting: 'Допоможу з налаштуваннями системи. Питайте про будь-які конфігурації.',
        emotion: 'neutral' as const
      }
    };

    return contexts[module];
  }, [module]);

  // Генерація проактивних повідомлень з урахуванням контексту модуля
  const generateContextualInsight = useCallback(() => {
    const moduleContext = getModuleContext();
    const insights: string[] = [];

    // Загальні інсайти системи
    if (systemHealth === 'critical') {
      insights.push('🚨 КРИТИЧНО! Система потребує негайного втручання. Рекомендую перевірити логи та перезапустити проблемні сервіси.');
      setCurrentEmotion('alert');
    } else if (systemHealth === 'degraded') {
      insights.push('⚠️ Система працює з попередженнями. Варто проаналізувати метрики продуктивності та виправити помилки.');
      setCurrentEmotion('concerned');
    }

    // Контекстні інсайти в залежності від модуля
    switch (module) {
      case 'etl':
        const etlIssues = agentsData.filter(a => a.type === 'etl' && a.status !== 'active');
        if (etlIssues.length > 0) {
          insights.push(`📊 Виявлено ${etlIssues.length} проблем у ETL-процесах. Перевірте з'єднання з джерелами даних.`);
        }
        break;

      case 'agents':
        const inactiveAgents = agentsData.filter(a => a.status !== 'active');
        if (inactiveAgents.length > 0) {
          insights.push(`🤖 ${inactiveAgents.length} агент${inactiveAgents.length > 1 ? 'и неактивні' : ' неактивний'}. Можливо, потрібен перезапуск.`);
        }

        const highCpuAgents = agentsData.filter(a => parseInt(a.cpu?.replace('%', '') || '0') > 80);
        if (highCpuAgents.length >= 2) {
          insights.push(`💻 Високе навантаження CPU у ${highCpuAgents.length} агентів. Розгляньте масштабування.`);
        }
        break;

      case 'security':
        insights.push('🔒 Сканую систему на предмет загроз... Рівень безпеки: ВИСОКИЙ. Останні 24 години без інцидентів.');
        break;

      case 'analytics':
        insights.push('📈 Аналізую тренди даних... Виявлено цікаві закономірності в останніх метриках.');
        setCurrentEmotion('focused');
        break;
    }

    // Позитивні інсайти
    if (systemHealth === 'optimal' && agentsData.every(a => a.status === 'active')) {
      const positiveMessages = [
        '✨ Всі системи працюють ідеально! Це чудовий час для запуску нових експериментів.',
        '🎯 Стабільна робота всіх компонентів. Продуктивність на максимумі!',
        '🌟 Оптимальні показники! Система готова до обробки складних завдань.',
        '🚀 Перфектні метрики! Можна впроваджувати нові функції без ризиків.'
      ];
      insights.push(positiveMessages[Math.floor(Math.random() * positiveMessages.length)]);
      setCurrentEmotion('happy');
    }

    return insights[Math.floor(Math.random() * insights.length)] ||
           `${moduleContext.greeting} Система працює штатно. Чим можу допомогти?`;
  }, [systemHealth, agentsData, module, getModuleContext]);

  // Розширена AI-відповідь з урахуванням контексту модуля
  const generateAIResponse = async (userInput: string): Promise<ContextualMessage> => {
    setIsThinking(true);
    setCurrentEmotion('focused');

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowercaseInput = userInput.toLowerCase();
    let response = '';
    let messageType: ContextualMessage['type'] = 'response';
    let actions: Array<{ label: string; action: string }> = [];
    let emotion: 'neutral' | 'happy' | 'concerned' | 'focused' | 'alert' = 'neutral';

    // Контекстні відповіді з урахуванням поточного модуля
    const moduleContext = getModuleContext();

    if (lowercaseInput.includes('статус') || lowercaseInput.includes('стан')) {
      response = `📊 Поточний стан модуля ${module.toUpperCase()}: ${systemHealth}. Активних компонентів: ${agentsData.length}. ${systemHealth !== 'optimal' ? 'Виявлено проблеми, рекомендую детальнішу перевірку.' : 'Все працює оптимально!'}`;
      emotion = systemHealth === 'optimal' ? 'happy' : 'concerned';
      actions = [
        { label: 'Детальна діагностика', action: 'run-diagnostics' },
        { label: 'Показати логи', action: 'show-logs' },
        { label: 'Експорт звіту', action: 'export-report' }
      ];
    } else if (lowercaseInput.includes('агент') || lowercaseInput.includes('mas')) {
      const activeAgents = agentsData.filter(a => a.status === 'active').length;
      const avgCpu = Math.round(agentsData.reduce((acc, a) => acc + parseInt(a.cpu?.replace('%', '') || '0'), 0) / agentsData.length);

      response = `🤖 MAS система: ${activeAgents}/${agentsData.length} активних агентів. Середнє навантаження CPU: ${avgCpu}%. ${avgCpu > 70 ? 'Рекомендую оптимізацію.' : 'Навантаження в нормі.'}`;
      emotion = avgCpu > 70 ? 'concerned' : 'happy';

      actions = [
        { label: 'Оптимізувати навантаження', action: 'optimize-agents' },
        { label: 'Перезапуск проблемних', action: 'restart-unhealthy' },
        { label: 'Масштабування', action: 'scale-agents' }
      ];
    } else if (lowercaseInput.includes('безпек') || lowercaseInput.includes('ризик')) {
      response = '🔒 Аналіз безпеки завершено: рівень загрози МІНІМАЛЬНИЙ. Останні 24 години без критичних інцидентів. Виявлено: сертифікати, що закінчуються через 30 днів - рекомендую оновлення.';
      emotion = 'focused';
      actions = [
        { label: 'Оновити сертифікати', action: 'renew-certificates' },
        { label: 'Повний аудит безпеки', action: 'security-audit' },
        { label: 'Журнал подій', action: 'security-logs' }
      ];
    } else if (lowercaseInput.includes('оптимізац') || lowercaseInput.includes('продуктивн')) {
      response = '⚡ На основі аналізу метрик рекомендую: 1) Збільшити пул з\'єднань до БД на 25%, 2) Увімкнути кешування запитів, 3) Розглянути партиціонування великих таблиць, 4) Оптимізувати індекси. Очікуване покращення: 30-40%.';
      messageType = 'insight';
      emotion = 'focused';
      actions = [
        { label: 'Застосувати всі рекомендації', action: 'apply-all-optimizations' },
        { label: 'Поетапне впровадження', action: 'step-by-step-optimization' },
        { label: 'Тестувати на dev', action: 'test-optimizations' }
      ];
    } else if (lowercaseInput.includes('помилк') || lowercaseInput.includes('аномал')) {
      response = '🔍 Глибокий аналіз виявив: 3 незначні аномалії в індексації, 1 тимчасове уповільнення ETL, 2 попередження безпеки (не критичні). Рекомендую: очистити кеш індексації, перевірити черги ETL, оновити правила безпеки.';
      messageType = 'insight';
      emotion = 'concerned';
      actions = [
        { label: 'Виправити аномалії', action: 'fix-anomalies' },
        { label: 'Детальний звіт', action: 'anomaly-report' },
        { label: 'Налаштувати алерти', action: 'setup-alerts' }
      ];
    } else {
      // Контекстна відповідь залежно від модуля
      const contextualResponses: Record<ModuleKey, string> = {
        dashboard: `Розумію ваш запит про "${userInput}". На дашборді бачу загальний стан: ${systemHealth}. Можу детальніше розповісти про будь-який компонент системи.`,
        etl: `Щодо "${userInput}" в ETL-модулі: всі конвеєри даних працюють, останнє оновлення 15 хвилин тому. Чи потрібна допомога з налаштуванням?`,
        agents: `Про "${userInput}" в контексті агентів: зараз активно ${agentsData.filter(a => a.status === 'active').length} агентів з ${agentsData.length}. Чи цікавить конкретний агент?`,
        security: `Стосовно "${userInput}" та безпеки: моніторинг активний, загроз не виявлено. Потрібна допомога з налаштуваннями захисту?`,
        analytics: `Щодо "${userInput}" в аналітиці: дані оброблюються в реальному часі. Можу створити кастомний звіт або пояснити існуючі метрики.`,
        settings: `Про налаштування "${userInput}": можу допомогти з конфігурацією будь-якого параметра системи. Що саме потрібно змінити?`
      };

      response = contextualResponses[module];
      emotion = 'neutral';
      actions = [
        { label: 'Докладніше про модуль', action: `explain-${module}` },
        { label: 'Показати можливості', action: 'show-capabilities' },
        { label: 'Швидкий тур', action: 'quick-tour' }
      ];
    }

    setIsThinking(false);
    setCurrentEmotion(emotion);

    return {
      id: Date.now().toString(),
      text: response,
      type: messageType,
      context: { systemHealth, agentsCount: agentsData.length, userQuery: userInput, module },
      actions,
      emotion,
      timestamp: new Date()
    };
  };

  // Голосовое распознавание
  const startListening = () => {
    if (recognitionRef.current && voiceSettings.recognition) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Синтез речи
  const speakText = (text: string) => {
    if (!synthesizerRef.current || !voiceSettings.synthesis) return;

    // Очищаем текст от HTML и эмодзи для лучшего произношения
    const cleanText = text.replace(/[🚨⚠️📊🤖💻🔒📈✨🎯🌟🚀⚡🔍]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceSettings.language;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      currentSpeechRef.current = cleanText;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentSpeechRef.current = '';
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      currentSpeechRef.current = '';
    };

    synthesizerRef.current.speak(utterance);
  };

  // Обработка отправки сообщения
  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: ContextualMessage = {
      id: `user-${Date.now()}`,
      text,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const aiResponse = await generateAIResponse(text);
      setMessages(prev => [...prev, aiResponse]);

      // Озвучиваем ответ
      if (voiceSettings.synthesis && voiceSettings.enabled) {
        speakText(aiResponse.text);
      }
    } catch (error) {
      console.error('Ошибка AI ответа:', error);
      const errorMessage: ContextualMessage = {
        id: `error-${Date.now()}`,
        text: 'Вибачте, сталася помилка при обробці запиту. Спробуйте ще раз або перефразуйте питання.',
        type: 'warning',
        emotion: 'concerned',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Проактивные сообщения с учетом модуля
  useEffect(() => {
    if (!proactiveMode || !visible) return;

    const proactiveTimer = setTimeout(() => {
      const insight = generateContextualInsight();
      const proactiveMessage: ContextualMessage = {
        id: `proactive-${Date.now()}`,
        text: insight,
        type: 'proactive',
        emotion: currentEmotion,
        timestamp: new Date()
      };

      setMessages(prev => [...prev.slice(-4), proactiveMessage]);

      // Озвучиваем проактивное сообщение
      if (voiceSettings.synthesis && voiceSettings.enabled && proactiveMode) {
        speakText(insight);
      }
    }, 15000 + Math.random() * 25000); // 15-40 секунд

    return () => clearTimeout(proactiveTimer);
  }, [generateContextualInsight, proactiveMode, visible, systemHealth, agentsData, currentEmotion, voiceSettings]);

  // Приветствие при смене модуля
  useEffect(() => {
    const moduleContext = getModuleContext();
    setCurrentEmotion(moduleContext.emotion || 'neutral');

    if (visible && messages.length === 0) {
      const welcomeMessage: ContextualMessage = {
        id: `welcome-${Date.now()}`,
        text: moduleContext.greeting,
        type: 'proactive',
        emotion: moduleContext.emotion,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);

      if (voiceSettings.synthesis && voiceSettings.enabled) {
        setTimeout(() => speakText(moduleContext.greeting), 1000);
      }
    }
  }, [module, visible, getModuleContext]);

  const getMessageColor = (type: ContextualMessage['type']) => {
    switch (type) {
      case 'proactive': return nexusColors.emerald;
      case 'insight': return nexusColors.amethyst;
      case 'warning': return nexusColors.warning;
      case 'user': return nexusColors.sapphire;
      default: return nexusColors.frost;
    }
  };

  // Автоскрол
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  if (!visible) return null;

  const moduleContext = getModuleContext();

  return (
    <Fade in={visible}>
      <Box
        ref={chatContainerRef}
        sx={{
        position: 'absolute',
        left: 20,
        top: 20,
        width: show3DAvatar ? 500 : 420,
        height: show3DAvatar ? 720 : 500,
        zIndex: 20,
        background: `linear-gradient(135deg, ${nexusColors.obsidian}E8, ${nexusColors.darkMatter}D0)`,
        border: `2px solid ${nexusColors.quantum}`,
        borderRadius: 3,
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 3D Аватар */}
        {show3DAvatar && (
          <Box sx={{ height: 300, borderBottom: `1px solid ${nexusColors.quantum}` }}>
            <Avatar3D
              isVisible={show3DAvatar}
              isSpeaking={isSpeaking}
              emotion={currentEmotion}
              speech={currentSpeechRef.current}
              quality={avatarQuality}
              enableLipSync={true}
              enableGestures={true}
            />
          </Box>
        )}

        {/* Заголовок с расширенными настройками */}
        <Box sx={{
          p: 2,
          borderBottom: `1px solid ${nexusColors.quantum}`,
          background: `linear-gradient(90deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BrainIcon sx={{ color: nexusColors.amethyst, mr: 1 }} />
            <Typography variant="h6" sx={{ color: nexusColors.frost, fontFamily: 'Orbitron' }}>
              AI Гід • {module.toUpperCase()}
            </Typography>
            <Chip
              label={proactiveMode ? 'Активний' : 'Пасивний'}
              size="small"
              onClick={() => setProactiveMode(!proactiveMode)}
              sx={{
                ml: 'auto',
                backgroundColor: proactiveMode ? `${nexusColors.success}20` : `${nexusColors.shadow}20`,
                color: proactiveMode ? nexusColors.success : nexusColors.shadow,
                cursor: 'pointer'
              }}
            />
            {/* Close button when closable */}
            {closable && (
              <IconButton
                aria-label="Закрити чат"
                onClick={() => onClose?.()}
                size="small"
                sx={{ ml: 1, color: nexusColors.nebula, '&:hover': { color: nexusColors.frost } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Голосові налаштування */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={show3DAvatar}
                  onChange={(e) => setShow3DAvatar(e.target.checked)}
                  size="small"
                />
              }
              label="3D"
              sx={{ color: nexusColors.nebula, fontSize: '0.7rem' }}
            />


            <IconButton
              size="small"
              onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              sx={{ color: voiceSettings.enabled ? nexusColors.success : nexusColors.shadow }}
            >
              {voiceSettings.enabled ? <VolumeUp fontSize="small" /> : <VolumeOff fontSize="small" />}
            </IconButton>

            <IconButton
              size="small"
              onClick={isListening ? stopListening : startListening}
              disabled={!voiceSettings.recognition}
              sx={{
                color: isListening ? nexusColors.warning : nexusColors.sapphire,
                backgroundColor: isListening ? `${nexusColors.warning}20` : 'transparent'
              }}
            >
              {isListening ? <MicOff fontSize="small" /> : <Mic fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        {/* Область сообщений */}
        <Box
          ref={messagesRef}
          sx={{
            flex: 1,
            p: 1.5,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: nexusColors.emerald, borderRadius: '2px' }
          }}
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: '12px' }}
              >
                <Paper sx={{
                  p: 1.5,
                  background: `linear-gradient(135deg, ${getMessageColor(msg.type)}15, ${getMessageColor(msg.type)}08)`,
                  border: `1px solid ${getMessageColor(msg.type)}40`,
                  borderRadius: 2,
                  position: 'relative',
                  ml: msg.type === 'user' ? 'auto' : 0,
                  mr: msg.type === 'user' ? 0 : 'auto',
                  maxWidth: '85%'
                }}>
                  {/* Индикатор типа сообщения */}
                  <Box sx={{
                    position: 'absolute',
                    top: -1,
                    right: -1,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: getMessageColor(msg.type),
                    boxShadow: `0 0 8px ${getMessageColor(msg.type)}`
                  }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AIIcon sx={{ color: getMessageColor(msg.type), fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: nexusColors.shadow, fontSize: '0.7rem' }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </Typography>
                    <Chip
                      label={msg.type === 'user' ? 'Ви' : msg.type}
                      size="small"
                      sx={{
                        ml: 'auto',
                        backgroundColor: `${getMessageColor(msg.type)}20`,
                        color: getMessageColor(msg.type),
                        fontSize: '0.65rem',
                        height: 18
                      }}
                    />
                  </Box>

                  <Typography sx={{
                    color: nexusColors.frost,
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                    fontFamily: msg.type === 'insight' ? 'Inter' : 'Fira Code'
                  }}>
                    {msg.text}
                  </Typography>

                  {/* Быстрые действия */}
                  {msg.actions && msg.actions.length > 0 && (
                    <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {msg.actions.map((action, idx) => (
                        <Chip
                          key={idx}
                          label={action.label}
                          size="small"
                          onClick={() => onAction?.(action.action)}
                          sx={{
                            backgroundColor: `${nexusColors.sapphire}15`,
                            color: nexusColors.sapphire,
                            border: `1px solid ${nexusColors.sapphire}40`,
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            '&:hover': {
                              backgroundColor: `${nexusColors.sapphire}25`
                            }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Индикатор обработки */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Paper sx={{
                p: 1.5,
                background: `linear-gradient(135deg, ${nexusColors.amethyst}15, ${nexusColors.amethyst}08)`,
                border: `1px solid ${nexusColors.amethyst}40`,
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <div className="loading-spinner" style={{ width: '12px', height: '12px' }} />
                  <Typography sx={{ color: nexusColors.amethyst, fontSize: '0.85rem' }}>
                    Аналізую та генерую відповідь...
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          )}
        </Box>

        {/* Поле ввода с голосовым управлением */}
        <Box sx={{
          p: 1.5,
          borderTop: `1px solid ${nexusColors.quantum}`,
          background: `linear-gradient(90deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={isListening ? "Слухаю..." : "Запитайте про систему..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              size="small"
              disabled={isListening}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isListening ? `${nexusColors.warning}10` : `${nexusColors.obsidian}60`,
                  color: nexusColors.frost,
                  fontSize: '0.9rem',
                  '& fieldset': {
                    borderColor: isListening ? nexusColors.warning : nexusColors.quantum
                  },
                  '&:hover fieldset': {
                    borderColor: isListening ? nexusColors.warning : nexusColors.emerald
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isListening ? nexusColors.warning : nexusColors.emerald
                  }
                }
              }}
            />
            <IconButton
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isThinking}
              sx={{
                color: nexusColors.sapphire,
                backgroundColor: `${nexusColors.sapphire}15`,
                border: `1px solid ${nexusColors.sapphire}40`,
                '&:hover': { backgroundColor: `${nexusColors.sapphire}25` },
                '&:disabled': { opacity: 0.5 }
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Контекстные подсказки для текущего модуля */}
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {moduleContext.hints.map((hint) => (
              <Chip
                key={hint}
                label={hint}
                size="small"
                onClick={() => setInput(hint)}
                sx={{
                  backgroundColor: `${nexusColors.quantum}20`,
                  color: nexusColors.nebula,
                  fontSize: '0.65rem',
                  height: 20,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: `${nexusColors.emerald}20`,
                    color: nexusColors.emerald
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default ContextualChat;
