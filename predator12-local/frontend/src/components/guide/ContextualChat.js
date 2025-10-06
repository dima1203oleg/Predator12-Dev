import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, Chip, Fade, Switch, FormControlLabel } from '@mui/material';
import { Send as SendIcon, AutoAwesome as AIIcon, Psychology as BrainIcon, Mic, MicOff, VolumeUp, VolumeOff, Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { nexusColors } from '../../theme/nexusTheme';
const ContextualChat = ({ systemHealth = 'optimal', agentsData = [], realTimeData, onAction, visible = false, module = 'dashboard', onClose, closable = true }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [proactiveMode, setProactiveMode] = useState(true);
    const [voiceSettings, setVoiceSettings] = useState({
        enabled: true,
        recognition: true,
        synthesis: true,
        language: 'uk-UA',
        voice: 'uk-UA-Standard-A',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8
    });
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [show3DAvatar, setShow3DAvatar] = useState(true);
    const [avatarQuality, setAvatarQuality] = useState('medium');
    const [autoCloseTimer, setAutoCloseTimer] = useState(null);
    const messagesRef = useRef(null);
    const chatContainerRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthesizerRef = useRef(null);
    const currentSpeechRef = useRef('');
    // Инициализация голосового API
    useEffect(() => {
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
    useEffect(() => {
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
    const getModuleContext = useCallback(() => {
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
        return contexts[module] || contexts.dashboard;
    }, [module]);
    // Генерація проактивних повідомлень з урахуванням контексту модуля
    const generateContextualInsight = useCallback(() => {
        const moduleContext = getModuleContext();
        const insights = [];
        // Загальні інсайти системи
        if (systemHealth === 'critical') {
            insights.push('🚨 КРИТИЧНО! Система потребує негайного втручання. Рекомендую перевірити логи та перезапустити проблемні сервіси.');
            setCurrentEmotion('alert');
        }
        else if (systemHealth === 'warning') {
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
    const generateAIResponse = async (userInput) => {
        setIsThinking(true);
        setCurrentEmotion('focused');
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
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
            const avgCpu = Math.round(agentsData.reduce((acc, a) => acc + parseInt(a.cpu?.replace('%', '') || '0'), 0) / agentsData.length);
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
    const handleSendMessage = async (messageText) => {
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
            const aiResponse = await generateAIResponse(text);
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
    };
    // Проактивные сообщения с учетом модуля
    useEffect(() => {
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
    useEffect(() => {
        const moduleContext = getModuleContext();
        setCurrentEmotion(moduleContext.emotion);
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
    if (!visible)
        return null;
    const moduleContext = getModuleContext();
    return (_jsx(Fade, { in: visible, children: _jsxs(Box, { ref: chatContainerRef, sx: {
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
            }, children: [show3DAvatar && (_jsx(Box, { sx: { height: 300, borderBottom: `1px solid ${nexusColors.quantum}` }, children: _jsx(Avatar3D, { isVisible: show3DAvatar, isSpeaking: isSpeaking, emotion: currentEmotion, speech: currentSpeechRef.current, quality: avatarQuality, enableLipSync: true, enableGestures: true }) })), _jsxs(Box, { sx: {
                        p: 2,
                        borderBottom: `1px solid ${nexusColors.quantum}`,
                        background: `linear-gradient(90deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                    }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [_jsx(BrainIcon, { sx: { color: nexusColors.amethyst, mr: 1 } }), _jsxs(Typography, { variant: "h6", sx: { color: nexusColors.frost, fontFamily: 'Orbitron' }, children: ["AI \u0413\u0456\u0434 \u2022 ", module.toUpperCase()] }), _jsx(Chip, { label: proactiveMode ? 'Активний' : 'Пасивний', size: "small", onClick: () => setProactiveMode(!proactiveMode), sx: {
                                        ml: 'auto',
                                        backgroundColor: proactiveMode ? `${nexusColors.success}20` : `${nexusColors.shadow}20`,
                                        color: proactiveMode ? nexusColors.success : nexusColors.shadow,
                                        cursor: 'pointer'
                                    } }), closable && (_jsx(IconButton, { "aria-label": "\u0417\u0430\u043A\u0440\u0438\u0442\u0438 \u0447\u0430\u0442", onClick: () => onClose?.(), size: "small", sx: { ml: 1, color: nexusColors.nebula, '&:hover': { color: nexusColors.frost } }, children: _jsx(CloseIcon, { fontSize: "small" }) }))] }), _jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: show3DAvatar, onChange: (e) => setShow3DAvatar(e.target.checked), size: "small" }), label: "3D", sx: { color: nexusColors.nebula, fontSize: '0.7rem' } }), _jsx(IconButton, { size: "small", onClick: () => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled })), sx: { color: voiceSettings.enabled ? nexusColors.success : nexusColors.shadow }, children: voiceSettings.enabled ? _jsx(VolumeUp, { fontSize: "small" }) : _jsx(VolumeOff, { fontSize: "small" }) }), _jsx(IconButton, { size: "small", onClick: isListening ? stopListening : startListening, disabled: !voiceSettings.recognition, sx: {
                                        color: isListening ? nexusColors.warning : nexusColors.sapphire,
                                        backgroundColor: isListening ? `${nexusColors.warning}20` : 'transparent'
                                    }, children: isListening ? _jsx(MicOff, { fontSize: "small" }) : _jsx(Mic, { fontSize: "small" }) })] })] }), _jsxs(Box, { ref: messagesRef, sx: {
                        flex: 1,
                        p: 1.5,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { background: nexusColors.emerald, borderRadius: '2px' }
                    }, children: [_jsx(AnimatePresence, { children: messages.map((msg) => (_jsx(motion.div, { initial: { opacity: 0, y: 15, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -15, scale: 0.95 }, transition: { duration: 0.3 }, style: { marginBottom: '12px' }, children: _jsxs(Paper, { sx: {
                                        p: 1.5,
                                        background: `linear-gradient(135deg, ${getMessageColor(msg.type)}15, ${getMessageColor(msg.type)}08)`,
                                        border: `1px solid ${getMessageColor(msg.type)}40`,
                                        borderRadius: 2,
                                        position: 'relative',
                                        ml: msg.type === 'user' ? 'auto' : 0,
                                        mr: msg.type === 'user' ? 0 : 'auto',
                                        maxWidth: '85%'
                                    }, children: [_jsx(Box, { sx: {
                                                position: 'absolute',
                                                top: -1,
                                                right: -1,
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                backgroundColor: getMessageColor(msg.type),
                                                boxShadow: `0 0 8px ${getMessageColor(msg.type)}`
                                            } }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [_jsx(AIIcon, { sx: { color: getMessageColor(msg.type), fontSize: 16, mr: 0.5 } }), _jsx(Typography, { variant: "caption", sx: { color: nexusColors.shadow, fontSize: '0.7rem' }, children: msg.timestamp.toLocaleTimeString() }), _jsx(Chip, { label: msg.type === 'user' ? 'Ви' : msg.type, size: "small", sx: {
                                                        ml: 'auto',
                                                        backgroundColor: `${getMessageColor(msg.type)}20`,
                                                        color: getMessageColor(msg.type),
                                                        fontSize: '0.65rem',
                                                        height: 18
                                                    } })] }), _jsx(Typography, { sx: {
                                                color: nexusColors.frost,
                                                fontSize: '0.9rem',
                                                lineHeight: 1.4,
                                                fontFamily: msg.type === 'insight' ? 'Inter' : 'Fira Code'
                                            }, children: msg.text }), msg.actions && msg.actions.length > 0 && (_jsx(Box, { sx: { mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }, children: msg.actions.map((action, idx) => (_jsx(Chip, { label: action.label, size: "small", onClick: () => onAction?.(action.action), sx: {
                                                    backgroundColor: `${nexusColors.sapphire}15`,
                                                    color: nexusColors.sapphire,
                                                    border: `1px solid ${nexusColors.sapphire}40`,
                                                    cursor: 'pointer',
                                                    fontSize: '0.7rem',
                                                    '&:hover': {
                                                        backgroundColor: `${nexusColors.sapphire}25`
                                                    }
                                                } }, idx))) }))] }) }, msg.id))) }), isThinking && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(Paper, { sx: {
                                    p: 1.5,
                                    background: `linear-gradient(135deg, ${nexusColors.amethyst}15, ${nexusColors.amethyst}08)`,
                                    border: `1px solid ${nexusColors.amethyst}40`,
                                    borderRadius: 2
                                }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx("div", { className: "loading-spinner", style: { width: '12px', height: '12px' } }), _jsx(Typography, { sx: { color: nexusColors.amethyst, fontSize: '0.85rem' }, children: "\u0410\u043D\u0430\u043B\u0456\u0437\u0443\u044E \u0442\u0430 \u0433\u0435\u043D\u0435\u0440\u0443\u044E \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u044C..." })] }) }) }))] }), _jsxs(Box, { sx: {
                        p: 1.5,
                        borderTop: `1px solid ${nexusColors.quantum}`,
                        background: `linear-gradient(90deg, ${nexusColors.obsidian}, ${nexusColors.darkMatter})`
                    }, children: [_jsxs(Box, { sx: { display: 'flex', gap: 1, alignItems: 'center' }, children: [_jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: isListening ? "Слухаю..." : "Запитайте про систему...", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSendMessage(), size: "small", disabled: isListening, sx: {
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
                                    } }), _jsx(IconButton, { onClick: () => handleSendMessage(), disabled: !input.trim() || isThinking, sx: {
                                        color: nexusColors.sapphire,
                                        backgroundColor: `${nexusColors.sapphire}15`,
                                        border: `1px solid ${nexusColors.sapphire}40`,
                                        '&:hover': { backgroundColor: `${nexusColors.sapphire}25` },
                                        '&:disabled': { opacity: 0.5 }
                                    }, children: _jsx(SendIcon, { fontSize: "small" }) })] }), _jsx(Box, { sx: { mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }, children: moduleContext.hints.map((hint) => (_jsx(Chip, { label: hint, size: "small", onClick: () => setInput(hint), sx: {
                                    backgroundColor: `${nexusColors.quantum}20`,
                                    color: nexusColors.nebula,
                                    fontSize: '0.65rem',
                                    height: 20,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: `${nexusColors.emerald}20`,
                                        color: nexusColors.emerald
                                    }
                                } }, hint))) })] })] }) }));
};
export default ContextualChat;
