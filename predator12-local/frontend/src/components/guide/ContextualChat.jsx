"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusTheme_1 = require("../../theme/nexusTheme");
const Avatar3D_1 = __importDefault(require("./Avatar3D"));
const ContextualChat = ({ systemHealth = 'optimal', agentsData = [], realTimeData, onAction, visible = false, module = 'dashboard', onClose, closable = true }) => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [input, setInput] = (0, react_1.useState)('');
    const [isThinking, setIsThinking] = (0, react_1.useState)(false);
    const [proactiveMode, setProactiveMode] = (0, react_1.useState)(true);
    const [voiceSettings, setVoiceSettings] = (0, react_1.useState)({
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
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [isSpeaking, setIsSpeaking] = (0, react_1.useState)(false);
    const [currentEmotion, setCurrentEmotion] = (0, react_1.useState)('neutral');
    const [show3DAvatar, setShow3DAvatar] = (0, react_1.useState)(true);
    const [avatarQuality, setAvatarQuality] = (0, react_1.useState)('medium');
    const [autoCloseTimer, setAutoCloseTimer] = (0, react_1.useState)(null);
    const messagesRef = (0, react_1.useRef)(null);
    const chatContainerRef = (0, react_1.useRef)(null);
    const recognitionRef = (0, react_1.useRef)(null);
    const synthesizerRef = (0, react_1.useRef)(null);
    const currentSpeechRef = (0, react_1.useRef)('');
    // Инициализация голосового API
    (0, react_1.useEffect)(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = voiceSettings.language;
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
            recognition.onresult = (event) => {
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
    (0, react_1.useEffect)(() => {
        if (!visible || !closable || !onClose)
            return;
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
            var _a;
            (_a = chatContainerRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener(event, resetOnActivity);
        });
        return () => {
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer);
            }
            activityEvents.forEach(event => {
                var _a;
                (_a = chatContainerRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener(event, resetOnActivity);
            });
        };
    }, [visible, closable, onClose, autoCloseTimer]);
    // Закриття при кліку поза чатом
    (0, react_1.useEffect)(() => {
        if (!visible || !closable || !onClose)
            return;
        const handleClickOutside = (event) => {
            if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, closable, onClose]);
    // Контекстные подсказки для разных модулей
    const getModuleContext = (0, react_1.useCallback)(() => {
        const contexts = {
            dashboard: {
                hints: ['статус системи', 'загальний огляд', 'ключові метрики', 'останні події'],
                greeting: 'Вітаю на головній панелі! Можу показати загальний стан системи або допомогти з навігацією.',
                emotion: 'neutral'
            },
            etl: {
                hints: ['процеси ETL', 'трансформація даних', 'джерела даних', 'помилки завантаження'],
                greeting: 'У модулі ETL можу допомогти з налаштуванням конвеєрів даних та діагностикою процесів.',
                emotion: 'focused'
            },
            agents: {
                hints: ['статус агентів', 'MAS система', 'продуктивність', 'перезапуск агентів'],
                greeting: 'Моніторю стан усіх агентів MAS. Можу надати детальну інформацію про їх роботу.',
                emotion: 'alert'
            },
            security: {
                hints: ['загрози безпеки', 'журнали доступу', 'сертифікати', 'аудит системи'],
                greeting: 'Модуль безпеки під моїм контролем. Повідомлю про будь-які підозрілі активності.',
                emotion: 'concerned'
            },
            analytics: {
                hints: ['аналіз даних', 'звіти', 'тренди', 'прогнози'],
                greeting: 'В аналітичному модулі можу пояснити дані та допомогти з інтерпретацією результатів.',
                emotion: 'focused'
            },
            settings: {
                hints: ['конфігурація', 'параметри системи', 'користувацькі налаштування', 'інтеграції'],
                greeting: 'Допоможу з налаштуваннями системи. Питайте про будь-які конфігурації.',
                emotion: 'neutral'
            }
        };
        return contexts[module];
    }, [module]);
    // Генерація проактивних повідомлень з урахуванням контексту модуля
    const generateContextualInsight = (0, react_1.useCallback)(() => {
        const moduleContext = getModuleContext();
        const insights = [];
        // Загальні інсайти системи
        if (systemHealth === 'critical') {
            insights.push('🚨 КРИТИЧНО! Система потребує негайного втручання. Рекомендую перевірити логи та перезапустити проблемні сервіси.');
            setCurrentEmotion('alert');
        }
        else if (systemHealth === 'degraded') {
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
                const highCpuAgents = agentsData.filter(a => { var _a; return parseInt(((_a = a.cpu) === null || _a === void 0 ? void 0 : _a.replace('%', '')) || '0') > 80; });
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
    const generateAIResponse = (userInput) => __awaiter(void 0, void 0, void 0, function* () {
        setIsThinking(true);
        setCurrentEmotion('focused');
        yield new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        const lowercaseInput = userInput.toLowerCase();
        let response = '';
        let messageType = 'response';
        let actions = [];
        let emotion = 'neutral';
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
        }
        else if (lowercaseInput.includes('агент') || lowercaseInput.includes('mas')) {
            const activeAgents = agentsData.filter(a => a.status === 'active').length;
            const avgCpu = Math.round(agentsData.reduce((acc, a) => { var _a; return acc + parseInt(((_a = a.cpu) === null || _a === void 0 ? void 0 : _a.replace('%', '')) || '0'); }, 0) / agentsData.length);
            response = `🤖 MAS система: ${activeAgents}/${agentsData.length} активних агентів. Середнє навантаження CPU: ${avgCpu}%. ${avgCpu > 70 ? 'Рекомендую оптимізацію.' : 'Навантаження в нормі.'}`;
            emotion = avgCpu > 70 ? 'concerned' : 'happy';
            actions = [
                { label: 'Оптимізувати навантаження', action: 'optimize-agents' },
                { label: 'Перезапуск проблемних', action: 'restart-unhealthy' },
                { label: 'Масштабування', action: 'scale-agents' }
            ];
        }
        else if (lowercaseInput.includes('безпек') || lowercaseInput.includes('ризик')) {
            response = '🔒 Аналіз безпеки завершено: рівень загрози МІНІМАЛЬНИЙ. Останні 24 години без критичних інцидентів. Виявлено: сертифікати, що закінчуються через 30 днів - рекомендую оновлення.';
            emotion = 'focused';
            actions = [
                { label: 'Оновити сертифікати', action: 'renew-certificates' },
                { label: 'Повний аудит безпеки', action: 'security-audit' },
                { label: 'Журнал подій', action: 'security-logs' }
            ];
        }
        else if (lowercaseInput.includes('оптимізац') || lowercaseInput.includes('продуктивн')) {
            response = '⚡ На основі аналізу метрик рекомендую: 1) Збільшити пул з\'єднань до БД на 25%, 2) Увімкнути кешування запитів, 3) Розглянути партиціонування великих таблиць, 4) Оптимізувати індекси. Очікуване покращення: 30-40%.';
            messageType = 'insight';
            emotion = 'focused';
            actions = [
                { label: 'Застосувати всі рекомендації', action: 'apply-all-optimizations' },
                { label: 'Поетапне впровадження', action: 'step-by-step-optimization' },
                { label: 'Тестувати на dev', action: 'test-optimizations' }
            ];
        }
        else if (lowercaseInput.includes('помилк') || lowercaseInput.includes('аномал')) {
            response = '🔍 Глибокий аналіз виявив: 3 незначні аномалії в індексації, 1 тимчасове уповільнення ETL, 2 попередження безпеки (не критичні). Рекомендую: очистити кеш індексації, перевірити черги ETL, оновити правила безпеки.';
            messageType = 'insight';
            emotion = 'concerned';
            actions = [
                { label: 'Виправити аномалії', action: 'fix-anomalies' },
                { label: 'Детальний звіт', action: 'anomaly-report' },
                { label: 'Налаштувати алерти', action: 'setup-alerts' }
            ];
        }
        else {
            // Контекстна відповідь залежно від модуля
            const contextualResponses = {
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
    });
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
    const speakText = (text) => {
        if (!synthesizerRef.current || !voiceSettings.synthesis)
            return;
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
    const handleSendMessage = (messageText) => __awaiter(void 0, void 0, void 0, function* () {
        const text = messageText || input.trim();
        if (!text)
            return;
        const userMessage = {
            id: `user-${Date.now()}`,
            text,
            type: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        try {
            const aiResponse = yield generateAIResponse(text);
            setMessages(prev => [...prev, aiResponse]);
            // Озвучиваем ответ
            if (voiceSettings.synthesis && voiceSettings.enabled) {
                speakText(aiResponse.text);
            }
        }
        catch (error) {
            console.error('Ошибка AI ответа:', error);
            const errorMessage = {
                id: `error-${Date.now()}`,
                text: 'Вибачте, сталася помилка при обробці запиту. Спробуйте ще раз або перефразуйте питання.',
                type: 'warning',
                emotion: 'concerned',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    });
    // Проактивные сообщения с учетом модуля
    (0, react_1.useEffect)(() => {
        if (!proactiveMode || !visible)
            return;
        const proactiveTimer = setTimeout(() => {
            const insight = generateContextualInsight();
            const proactiveMessage = {
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
    (0, react_1.useEffect)(() => {
        const moduleContext = getModuleContext();
        setCurrentEmotion(moduleContext.emotion || 'neutral');
        if (visible && messages.length === 0) {
            const welcomeMessage = {
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
    const getMessageColor = (type) => {
        switch (type) {
            case 'proactive': return nexusTheme_1.nexusColors.emerald;
            case 'insight': return nexusTheme_1.nexusColors.amethyst;
            case 'warning': return nexusTheme_1.nexusColors.warning;
            case 'user': return nexusTheme_1.nexusColors.sapphire;
            default: return nexusTheme_1.nexusColors.frost;
        }
    };
    // Автоскрол
    (0, react_1.useEffect)(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);
    if (!visible)
        return null;
    const moduleContext = getModuleContext();
    return (<material_1.Fade in={visible}>
      <material_1.Box ref={chatContainerRef} sx={{
            position: 'absolute',
            left: 20,
            top: 20,
            width: show3DAvatar ? 500 : 420,
            height: show3DAvatar ? 720 : 500,
            zIndex: 20,
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.obsidian}E8, ${nexusTheme_1.nexusColors.darkMatter}D0)`,
            border: `2px solid ${nexusTheme_1.nexusColors.quantum}`,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
        {/* 3D Аватар */}
        {show3DAvatar && (<material_1.Box sx={{ height: 300, borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}` }}>
            <Avatar3D_1.default isVisible={show3DAvatar} isSpeaking={isSpeaking} emotion={currentEmotion} speech={currentSpeechRef.current} quality={avatarQuality} enableLipSync={true} enableGestures={true}/>
          </material_1.Box>)}

        {/* Заголовок с расширенными настройками */}
        <material_1.Box sx={{
            p: 2,
            borderBottom: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})`
        }}>
          <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <icons_material_1.Psychology sx={{ color: nexusTheme_1.nexusColors.amethyst, mr: 1 }}/>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.frost, fontFamily: 'Orbitron' }}>
              AI Гід • {module.toUpperCase()}
            </material_1.Typography>
            <material_1.Chip label={proactiveMode ? 'Активний' : 'Пасивний'} size="small" onClick={() => setProactiveMode(!proactiveMode)} sx={{
            ml: 'auto',
            backgroundColor: proactiveMode ? `${nexusTheme_1.nexusColors.success}20` : `${nexusTheme_1.nexusColors.shadow}20`,
            color: proactiveMode ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.shadow,
            cursor: 'pointer'
        }}/>
            {/* Close button when closable */}
            {closable && (<material_1.IconButton aria-label="Закрити чат" onClick={() => onClose === null || onClose === void 0 ? void 0 : onClose()} size="small" sx={{ ml: 1, color: nexusTheme_1.nexusColors.nebula, '&:hover': { color: nexusTheme_1.nexusColors.frost } }}>
                <icons_material_1.Close fontSize="small"/>
              </material_1.IconButton>)}
          </material_1.Box>

          {/* Голосові налаштування */}
          <material_1.Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <material_1.FormControlLabel control={<material_1.Switch checked={show3DAvatar} onChange={(e) => setShow3DAvatar(e.target.checked)} size="small"/>} label="3D" sx={{ color: nexusTheme_1.nexusColors.nebula, fontSize: '0.7rem' }}/>


            <material_1.IconButton size="small" onClick={() => setVoiceSettings(prev => (Object.assign(Object.assign({}, prev), { enabled: !prev.enabled })))} sx={{ color: voiceSettings.enabled ? nexusTheme_1.nexusColors.success : nexusTheme_1.nexusColors.shadow }}>
              {voiceSettings.enabled ? <icons_material_1.VolumeUp fontSize="small"/> : <icons_material_1.VolumeOff fontSize="small"/>}
            </material_1.IconButton>

            <material_1.IconButton size="small" onClick={isListening ? stopListening : startListening} disabled={!voiceSettings.recognition} sx={{
            color: isListening ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.sapphire,
            backgroundColor: isListening ? `${nexusTheme_1.nexusColors.warning}20` : 'transparent'
        }}>
              {isListening ? <icons_material_1.MicOff fontSize="small"/> : <icons_material_1.Mic fontSize="small"/>}
            </material_1.IconButton>
          </material_1.Box>
        </material_1.Box>

        {/* Область сообщений */}
        <material_1.Box ref={messagesRef} sx={{
            flex: 1,
            p: 1.5,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: nexusTheme_1.nexusColors.emerald, borderRadius: '2px' }
        }}>
          <framer_motion_1.AnimatePresence>
            {messages.map((msg) => (<framer_motion_1.motion.div key={msg.id} initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.95 }} transition={{ duration: 0.3 }} style={{ marginBottom: '12px' }}>
                <material_1.Paper sx={{
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
                  <material_1.Box sx={{
                position: 'absolute',
                top: -1,
                right: -1,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getMessageColor(msg.type),
                boxShadow: `0 0 8px ${getMessageColor(msg.type)}`
            }}/>

                  <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <icons_material_1.AutoAwesome sx={{ color: getMessageColor(msg.type), fontSize: 16, mr: 0.5 }}/>
                    <material_1.Typography variant="caption" sx={{ color: nexusTheme_1.nexusColors.shadow, fontSize: '0.7rem' }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </material_1.Typography>
                    <material_1.Chip label={msg.type === 'user' ? 'Ви' : msg.type} size="small" sx={{
                ml: 'auto',
                backgroundColor: `${getMessageColor(msg.type)}20`,
                color: getMessageColor(msg.type),
                fontSize: '0.65rem',
                height: 18
            }}/>
                  </material_1.Box>

                  <material_1.Typography sx={{
                color: nexusTheme_1.nexusColors.frost,
                fontSize: '0.9rem',
                lineHeight: 1.4,
                fontFamily: msg.type === 'insight' ? 'Inter' : 'Fira Code'
            }}>
                    {msg.text}
                  </material_1.Typography>

                  {/* Быстрые действия */}
                  {msg.actions && msg.actions.length > 0 && (<material_1.Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {msg.actions.map((action, idx) => (<material_1.Chip key={idx} label={action.label} size="small" onClick={() => onAction === null || onAction === void 0 ? void 0 : onAction(action.action)} sx={{
                        backgroundColor: `${nexusTheme_1.nexusColors.sapphire}15`,
                        color: nexusTheme_1.nexusColors.sapphire,
                        border: `1px solid ${nexusTheme_1.nexusColors.sapphire}40`,
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        '&:hover': {
                            backgroundColor: `${nexusTheme_1.nexusColors.sapphire}25`
                        }
                    }}/>))}
                    </material_1.Box>)}
                </material_1.Paper>
              </framer_motion_1.motion.div>))}
          </framer_motion_1.AnimatePresence>

          {/* Индикатор обработки */}
          {isThinking && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <material_1.Paper sx={{
                p: 1.5,
                background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.amethyst}15, ${nexusTheme_1.nexusColors.amethyst}08)`,
                border: `1px solid ${nexusTheme_1.nexusColors.amethyst}40`,
                borderRadius: 2
            }}>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <div className="loading-spinner" style={{ width: '12px', height: '12px' }}/>
                  <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.amethyst, fontSize: '0.85rem' }}>
                    Аналізую та генерую відповідь...
                  </material_1.Typography>
                </material_1.Box>
              </material_1.Paper>
            </framer_motion_1.motion.div>)}
        </material_1.Box>

        {/* Поле ввода с голосовым управлением */}
        <material_1.Box sx={{
            p: 1.5,
            borderTop: `1px solid ${nexusTheme_1.nexusColors.quantum}`,
            background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.obsidian}, ${nexusTheme_1.nexusColors.darkMatter})`
        }}>
          <material_1.Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <material_1.TextField fullWidth variant="outlined" placeholder={isListening ? "Слухаю..." : "Запитайте про систему..."} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} size="small" disabled={isListening} sx={{
            '& .MuiOutlinedInput-root': {
                backgroundColor: isListening ? `${nexusTheme_1.nexusColors.warning}10` : `${nexusTheme_1.nexusColors.obsidian}60`,
                color: nexusTheme_1.nexusColors.frost,
                fontSize: '0.9rem',
                '& fieldset': {
                    borderColor: isListening ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.quantum
                },
                '&:hover fieldset': {
                    borderColor: isListening ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.emerald
                },
                '&.Mui-focused fieldset': {
                    borderColor: isListening ? nexusTheme_1.nexusColors.warning : nexusTheme_1.nexusColors.emerald
                }
            }
        }}/>
            <material_1.IconButton onClick={() => handleSendMessage()} disabled={!input.trim() || isThinking} sx={{
            color: nexusTheme_1.nexusColors.sapphire,
            backgroundColor: `${nexusTheme_1.nexusColors.sapphire}15`,
            border: `1px solid ${nexusTheme_1.nexusColors.sapphire}40`,
            '&:hover': { backgroundColor: `${nexusTheme_1.nexusColors.sapphire}25` },
            '&:disabled': { opacity: 0.5 }
        }}>
              <icons_material_1.Send fontSize="small"/>
            </material_1.IconButton>
          </material_1.Box>

          {/* Контекстные подсказки для текущего модуля */}
          <material_1.Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {moduleContext.hints.map((hint) => (<material_1.Chip key={hint} label={hint} size="small" onClick={() => setInput(hint)} sx={{
                backgroundColor: `${nexusTheme_1.nexusColors.quantum}20`,
                color: nexusTheme_1.nexusColors.nebula,
                fontSize: '0.65rem',
                height: 20,
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: `${nexusTheme_1.nexusColors.emerald}20`,
                    color: nexusTheme_1.nexusColors.emerald
                }
            }}/>))}
          </material_1.Box>
        </material_1.Box>
      </material_1.Box>
    </material_1.Fade>);
};
exports.default = ContextualChat;
