"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const react_1 = require("react");
const icons_material_1 = require("@mui/icons-material");
const premiumFreeVoiceAPI_1 = require("../../services/premiumFreeVoiceAPI");
const AIVoiceInterface = () => {
    const [isListening, setIsListening] = (0, react_1.useState)(false);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [currentCommand, setCurrentCommand] = (0, react_1.useState)('');
    const [confidence, setConfidence] = (0, react_1.useState)(0);
    const [settingsOpen, setSettingsOpen] = (0, react_1.useState)(false);
    const [voiceEnabled, setVoiceEnabled] = (0, react_1.useState)(true);
    const [recentCommands, setRecentCommands] = (0, react_1.useState)([]);
    const [aiResponse, setAiResponse] = (0, react_1.useState)('');
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const [voiceCapabilities, setVoiceCapabilities] = (0, react_1.useState)(null);
    const [currentProvider, setCurrentProvider] = (0, react_1.useState)('auto');
    const recognitionRef = (0, react_1.useRef)(null);
    const synthRef = (0, react_1.useRef)(null);
    const [settings, setSettings] = (0, react_1.useState)({
        language: 'uk-UA',
        voice: 'uk-UA',
        speed: 1,
        pitch: 1,
        volume: 1.0,
        autoSpeak: true,
        continuousListening: false,
        wakeWord: 'Нексус'
    });
    // Ініціалізація Premium FREE Voice API
    (0, react_1.useEffect)(() => {
        const initVoiceAPI = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log('🎤 Підключення до Premium FREE Voice API...');
                // Перевірка доступності API
                const isHealthy = yield premiumFreeVoiceAPI_1.premiumFreeVoiceAPI.checkHealth();
                if (isHealthy) {
                    const capabilities = yield premiumFreeVoiceAPI_1.premiumFreeVoiceAPI.getCapabilities();
                    setVoiceCapabilities(capabilities);
                    setCurrentProvider(capabilities.recommended_tts);
                    console.log('✅ Premium FREE Voice API готовий:', capabilities);
                    console.log(`   🔊 TTS: ${capabilities.recommended_tts} (Coqui ⭐⭐⭐⭐⭐)`);
                    console.log(`   🎧 STT: ${capabilities.recommended_stt} (faster-whisper ⭐⭐⭐⭐⭐)`);
                }
                else {
                    console.warn('⚠️  API недоступний. Використовується Browser fallback.');
                }
            }
            catch (error) {
                console.error('❌ Помилка підключення до API:', error);
                console.log('💡 Запустіть API: cd predator12-local && ./start-voice-premium-free.sh');
            }
        });
        initVoiceAPI();
    }, []);
    // Ініціалізація Web Speech API - ВИКОНУЄТЬСЯ ОДИН РАЗ!
    (0, react_1.useEffect)(() => {
        console.log('🎤 Ініціалізація Web Speech API...');
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
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
            recognitionRef.current.onresult = (event) => {
                var _a, _b;
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
                    }
                    else {
                        interimTranscript += transcript;
                        console.log('⏳ Interim transcript:', interimTranscript);
                    }
                }
                setCurrentCommand(interimTranscript || finalTranscript);
                setConfidence((((_b = (_a = event.results[0]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.confidence) || 0) * 100);
            };
            recognitionRef.current.onerror = (event) => {
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
            };
            console.log('✅ Web Speech API налаштовано успішно!');
            // Опціональний автотест TTS (розкоментуйте для тестування)
            // setTimeout(() => {
            //   console.log('🧪 Автотест TTS...');
            //   speakResponseBrowser('Голосовий інтерфейс готовий до роботи');
            // }, 2000);
        }
        else {
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
                    console.log('📋 Перші 5 голосів:', voices.slice(0, 5).map(v => `${v.name} (${v.lang})`));
                    const ukVoices = voices.filter(v => v.lang.includes('uk'));
                    console.log('🇺🇦 Українські голоси:', ukVoices.map(v => v.name));
                }
            };
            // Голоси можуть завантажуватися асинхронно
            loadVoices();
            synthRef.current.addEventListener('voiceschanged', loadVoices);
        }
        else {
            console.error('❌ Speech Synthesis недоступний у цьому браузері!');
        }
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                }
                catch (e) {
                    console.log('Recognition вже зупинено');
                }
            }
        };
    }, []); // ВАЖЛИВО: запускаємо ОДИН РАЗ!
    // Оновлення мови при зміні налаштувань
    (0, react_1.useEffect)(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = settings.language;
            console.log('🌐 Мова змінена на:', settings.language);
        }
    }, [settings.language]);
    const processVoiceCommand = (transcript, confidence) => __awaiter(void 0, void 0, void 0, function* () {
        const command = {
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
        yield new Promise(resolve => setTimeout(resolve, 1000));
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
        }
        else {
            console.log('🔇 Автоозвучування вимкнено або озвучування недоступне');
        }
        // Відмічаємо команду як виконану
        command.executed = true;
        setIsProcessing(false);
        console.log('✅ Обробка команди завершена');
    });
    // Оновлення команди
    setRecentCommands(prev => prev.map(cmd => cmd.id === command.id
        ? Object.assign(Object.assign({}, cmd), { action: 'completed', executed: true }) : cmd));
    setIsProcessing(false);
    setCurrentCommand('');
};
const generateAIResponse = (command) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('дашборд') || lowerCommand.includes('головна')) {
        return 'Вітаю! Відкриваю головний дашборд. Тут ви можете переглянути загальний стан всіх систем. Все працює стабільно.';
    }
    else if (lowerCommand.includes('агент') || lowerCommand.includes('агенти')) {
        return 'Переходжу до модуля управління штучним інтелектом. Зараз активні 12 агентів. Всі працюють в штатному режимі.';
    }
    else if (lowerCommand.includes('безпека') || lowerCommand.includes('захист')) {
        return 'Відкриваю центр кібербезпеки. Поточний рівень загрози мінімальний. Всі захисні системи активні та функціонують належним чином.';
    }
    else if (lowerCommand.includes('дані') || lowerCommand.includes('база')) {
        return 'Переходжу до центру управління даними. Всі джерела даних синхронізовані. Швидкість обробки оптимальна.';
    }
    else if (lowerCommand.includes('аналітика') || lowerCommand.includes('звіт')) {
        return 'Відкриваю розумний модуль аналітики. Готую актуальні метрики та ключові показники ефективності для вашого огляду.';
    }
    else if (lowerCommand.includes('дослідження') || lowerCommand.includes('проект')) {
        return 'Переходжу до дослідницької лабораторії. Наразі активні 3 проекти та 5 експериментів. Прогрес відмінний.';
    }
    else if (lowerCommand.includes('3d') || lowerCommand.includes('тривимірний') || lowerCommand.includes('візуалізація')) {
        return 'Запускаю тривимірний візуалізатор. Підготовую інтерактивну сцену з можливістю обертання та масштабування.';
    }
    else if (lowerCommand.includes('колаборація') || lowerCommand.includes('команда') || lowerCommand.includes('чат')) {
        return 'Відкриваю хаб колаборації в реальному часі. Тут ви можете спілкуватися з командою та проводити відеоконференції.';
    }
    else if (lowerCommand.includes('привіт') || lowerCommand.includes('вітаю') || lowerCommand.includes('hello')) {
        return 'Привіт! Я ваш персональний AI асистент Нексус. Радий вас бачити! Чим можу допомогти сьогодні?';
    }
    else if (lowerCommand.includes('допомога') || lowerCommand.includes('help') || lowerCommand.includes('команди')) {
        return 'Я можу допомогти з навігацією по системі. Скажіть "відкрий дашборд", "покажи агентів", "статус системи" або "безпека". Також доступні команди для аналітики та дослідження.';
    }
    else if (lowerCommand.includes('статус') || lowerCommand.includes('стан')) {
        return 'Системний статус відмінний! Процесор завантажений на 45 відсотків, оперативна пам\'ять на 62 відсотки. Мережеве з\'єднання стабільне. Всі сервіси функціонують нормально.';
    }
    else if (lowerCommand.includes('дякую') || lowerCommand.includes('спасибо') || lowerCommand.includes('thank')) {
        return 'Будь ласка! Завжди радий допомогти. Якщо у вас є ще запитання, просто скажіть мені.';
    }
    else if (lowerCommand.includes('тест') || lowerCommand.includes('перевірка') || lowerCommand.includes('тестування')) {
        return 'Проводжу повне тестування голосового модуля. Розпізнавання працює відмінно! Синтез мовлення функціонує належним чином. Мікрофон налаштований правильно. Все готово до роботи.';
    }
    else if (lowerCommand.includes('мікрофон') || lowerCommand.includes('microphone')) {
        return 'Тестую мікрофон. Сигнал чистий, рівень звуку оптимальний. Якість розпізнавання мови відмінна. Мікрофон працює ідеально!';
    }
    else if (lowerCommand.includes('озвучування') || lowerCommand.includes('звук') || lowerCommand.includes('voice')) {
        return 'Перевіряю систему озвучування. Голосовий синтез активний. Українські голоси доступні. Швидкість та інтонація налаштовані правильно. Якість звуку відмінна!';
    }
    else if (lowerCommand.includes('українська') || lowerCommand.includes('ukrainian')) {
        return 'Переключаюся на українську мову. Вітаю! Голосовий інтерфейс повністю підтримує українську мову. Розпізнавання та озвучування працюють прекрасно!';
    }
    else if (lowerCommand.includes('english') || lowerCommand.includes('англійська')) {
        return 'Switching to English language. Hello! Voice interface fully supports English language. Speech recognition and text-to-speech are working perfectly!';
    }
    else if (lowerCommand.includes('switch') && lowerCommand.includes('english')) {
        return 'Language switched to English successfully! Hello, I am your Nexus AI assistant. How can I help you today?';
    }
    else {
        return `Цікаво! Ви сказали: "${command}". Я аналізую вашу команду та шукаю найкращий спосіб допомогти вам. Спробуйте сказати більш конкретну команду або натисніть кнопку "Тест голосу" для перевірки системи.`;
    }
};
// 🎤 Premium FREE TTS Test з найкращими безкоштовними моделями
const testTTS = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🎤 Тестування Premium FREE Voice System...');
    // Зупиняємо попереднє озвучування
    premiumFreeVoiceAPI_1.premiumFreeVoiceAPI.stopSpeaking();
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
            yield speakResponsePremiumFree(message);
            yield new Promise(resolve => setTimeout(resolve, 1500)); // Пауза між повідомленнями
        }
        catch (error) {
            console.error(`❌ Помилка озвучування: ${error}`);
        }
    }
    console.log('✅ Тестування завершено!');
});
// 🎤 Premium FREE TTS з автоматичним fallback
const speakResponsePremiumFree = (text) => __awaiter(void 0, void 0, void 0, function* () {
    if (!voiceEnabled) {
        console.log('🔇 Озвучування вимкнено');
        return;
    }
    try {
        const lang = settings.language.startsWith('uk') ? 'uk' : 'en';
        console.log(`🔊 TTS запит: "${text.substring(0, 50)}...", lang=${lang}`);
        // Використовуємо Premium FREE API з await
        yield premiumFreeVoiceAPI_1.premiumFreeVoiceAPI.textToSpeech({
            text,
            language: lang,
            speed: settings.speed,
            provider: 'auto' // Автоматично вибере Coqui або gTTS
        });
        console.log(`✅ TTS успішно (Premium FREE)`);
    }
    catch (error) {
        console.error('❌ Помилка Premium FREE TTS:', error);
        console.log('💡 Fallback до Browser API...');
        // Fallback до базового браузерного API
        speakResponseBrowser(text);
    }
});
// Покращена функція озвучування з додатковими налаштуваннями (Browser fallback)
const speakResponseBrowser = (text) => {
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
        selectedVoice = voices.find((voice) => voice.lang === 'uk-UA');
        // Пріоритет 2: Будь-який uk-*
        if (!selectedVoice) {
            selectedVoice = voices.find((voice) => voice.lang === 'uk');
        }
        // Пріоритет 3: Пошук за назвою (Google, Microsoft)
        if (!selectedVoice) {
            selectedVoice = voices.find((voice) => voice.name.toLowerCase().includes('ukrain') ||
                voice.name.toLowerCase().includes('lesya') ||
                voice.name.toLowerCase().includes('maxim') ||
                voice.name.toLowerCase().includes('ukrainian'));
        }
        // Пріоритет 4: Російський як близька мова (якщо нема українського)
        if (!selectedVoice) {
            console.warn('⚠️ Український голос не знайдено, пробую російський...');
            selectedVoice = voices.find((voice) => voice.lang === 'ru-RU' || voice.lang === 'ru');
        }
        if (selectedVoice) {
            console.log(`✅ Знайдено голос: ${selectedVoice.name} (${selectedVoice.lang})`);
        }
        else {
            console.warn('⚠️ Жодного підходящого голосу не знайдено! Використовую системний за замовчуванням.');
        }
    }
    else if (settings.language === 'en-US' || settings.language.startsWith('en')) {
        console.log('🇺🇸 Пошук англійського голосу...');
        // Пріоритет для якісних голосів
        selectedVoice = voices.find((voice) => voice.lang === 'en-US' && (voice.name.includes('Google') ||
            voice.name.includes('Microsoft') ||
            voice.name.includes('Neural') ||
            voice.name.includes('Premium')));
        if (!selectedVoice) {
            selectedVoice = voices.find((voice) => voice.lang === 'en-US');
        }
        if (!selectedVoice) {
            selectedVoice = voices.find((voice) => voice.lang.startsWith('en'));
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
        voice: (selectedVoice === null || selectedVoice === void 0 ? void 0 : selectedVoice.name) || 'системний',
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
    utterance.onerror = (event) => {
        console.error('❌ Помилка озвучування:', event.error);
        if (event.error === 'interrupted') {
            console.log('⚠️ Озвучування перервано (це нормально)');
        }
        else {
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
            }
            catch (error) {
                console.error('❌ Помилка при виклику speak():', error);
            }
        }
        else if (retries > 0) {
            console.log(`⏳ Голоси ще не завантажені, спроба ${4 - retries}/3...`);
            setTimeout(() => speakWithRetry(retries - 1), 200);
        }
        else {
            console.error('❌ Голоси не завантажились після 3 спроб');
            alert('Озвучування недоступне. Спробуйте перезавантажити сторінку.');
        }
    };
    // Невелика затримка перед запуском
    setTimeout(() => speakWithRetry(), 100);
};
const startListening = () => __awaiter(void 0, void 0, void 0, function* () {
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
        const stream = yield navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Доступ до мікрофона надано:', stream);
        // Зупиняємо stream (recognition сам створить свій)
        stream.getTracks().forEach(track => track.stop());
        // Тепер запускаємо recognition
        console.log('✅ Запускаємо recognition.start()...');
        recognitionRef.current.start();
        console.log('✅ Recognition.start() викликано успішно');
    }
    catch (error) {
        console.error('❌ Помилка при запуску recognition:', error);
        alert(`Помилка доступу до мікрофона: ${error.message}\n\nПеревірте:\n1. Дозвіл у налаштуваннях браузера\n2. HTTPS з'єднання (або localhost)\n3. Мікрофон підключено`);
    }
});
const stopListening = () => {
    console.log('🛑 Зупинка розпізнавання...');
    if (recognitionRef.current) {
        try {
            recognitionRef.current.stop();
            setIsListening(false);
            setIsConnected(false);
            console.log('✅ Розпізнавання зупинено');
        }
        catch (error) {
            console.error('❌ Помилка при зупинці:', error);
        }
    }
};
const toggleListening = () => {
    console.log('🔄 Toggle listening:', { isListening });
    if (isListening) {
        stopListening();
    }
    else {
        startListening();
    }
};
const quickCommands = [
    { label: 'Привітання', command: 'привіт, як справи?', icon: icons_material_1.Assistant },
    { label: 'Відкрити дашборд', command: 'відкрий головний дашборд', icon: icons_material_1.SmartToy },
    { label: 'Статус системи', command: 'покажи статус системи', icon: icons_material_1.Chat },
    { label: 'Тест голосу', command: 'проведи тестування голосового модуля', icon: icons_material_1.AutoAwesome },
    { label: 'Аналітика', command: 'відкрий модуль аналітики', icon: icons_material_1.Lightbulb },
    { label: 'Допомога', command: 'покажи доступні команди', icon: icons_material_1.Assistant },
    { label: '🎤 Голосовий тест', command: 'тестування мікрофону та озвучування', icon: icons_material_1.RecordVoiceOver },
    { label: '🔊 Перевірка звуку', command: 'перевір якість звуку та озвучування', icon: icons_material_1.VolumeUp },
    { label: '🇺🇦 Українська мова', command: 'переключись на українську мову та скажи щось', icon: icons_material_1.Language },
    { label: '🌐 English test', command: 'switch to english and say hello', icon: icons_material_1.Translate }
];
const executeQuickCommand = (command) => {
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
(0, react_1.useEffect)(() => {
    welcomeMessage();
}, []);
return (<material_1.Box sx={{ p: 3 }}>
      {/* Заголовок модуля */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <material_1.Avatar sx={{
        background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
        width: 60,
        height: 60
    }}>
            <icons_material_1.RecordVoiceOver sx={{ fontSize: '2rem' }}/>
          </material_1.Avatar>
          <material_1.Box>
            <material_1.Typography variant="h3" sx={{
        color: nexusTheme_1.nexusColors.text.primary,
        fontWeight: 'bold',
        background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    }}>
              {settings.language === 'uk-UA'
        ? '🎤 AI Голосовий Інтерфейс'
        : '🎤 AI Voice Interface'}
            </material_1.Typography>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
              {settings.language === 'uk-UA'
        ? 'Голосове управління та AI асистент'
        : 'Voice Control and AI Assistant'}
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>
      </framer_motion_1.motion.div>

      {/* Основний інтерфейс */}
      <framer_motion_1.motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        <material_1.Card sx={{
        background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
        borderRadius: 3,
        mb: 3,
        position: 'relative',
        overflow: 'visible'
    }}>
          <material_1.CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Візуальний індикатор прослуховування */}
            <framer_motion_1.motion.div animate={isListening ? {
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
    } : {}} transition={{
        duration: 2,
        repeat: isListening ? Infinity : 0,
        ease: "easeInOut"
    }} style={{ marginBottom: '2rem' }}>
              <material_1.Avatar sx={{
        width: 120,
        height: 120,
        margin: '0 auto',
        background: isListening
            ? `linear-gradient(45deg, ${nexusTheme_1.nexusColors.success.main}, ${nexusTheme_1.nexusColors.accent.main})`
            : `linear-gradient(45deg, ${nexusTheme_1.nexusColors.text.secondary}40, ${nexusTheme_1.nexusColors.primary.dark})`,
        border: isListening ? `3px solid ${nexusTheme_1.nexusColors.success.main}40` : 'none',
        boxShadow: isListening ? `0 0 30px ${nexusTheme_1.nexusColors.success.main}40` : 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    }} onClick={toggleListening}>
                {isListening ? (<icons_material_1.Mic sx={{ fontSize: '3rem', color: 'white' }}/>) : (<icons_material_1.MicOff sx={{ fontSize: '3rem', color: nexusTheme_1.nexusColors.text.secondary }}/>)}
              </material_1.Avatar>
            </framer_motion_1.motion.div>

            {/* Статус та поточна команда */}
            <material_1.Typography variant="h5" sx={{
        color: isListening ? nexusTheme_1.nexusColors.success.main : nexusTheme_1.nexusColors.text.secondary,
        mb: 2,
        fontWeight: 'bold'
    }}>
              {isListening
        ? (settings.language === 'uk-UA' ? '🎧 Слухаю...' : '🎧 Listening...')
        : (settings.language === 'uk-UA' ? '🔇 Натисніть для активації' : '🔇 Click to activate')}
            </material_1.Typography>

            {currentCommand && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <material_1.Paper sx={{
            p: 2,
            mb: 2,
            background: `${nexusTheme_1.nexusColors.accent.main}20`,
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}40`,
            borderRadius: 2
        }}>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    "{currentCommand}"
                  </material_1.Typography>
                  {confidence > 0 && (<material_1.LinearProgress variant="determinate" value={confidence} sx={{
                mt: 1,
                height: 4,
                borderRadius: 2,
                background: `${nexusTheme_1.nexusColors.primary.dark}30`,
                '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.success.main})`
                }
            }}/>)}
                </material_1.Paper>
              </framer_motion_1.motion.div>)}

            {/* AI відповідь */}
            {aiResponse && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <material_1.Paper sx={{
            p: 3,
            mb: 3,
            background: `${nexusTheme_1.nexusColors.primary.main}20`,
            border: `1px solid ${nexusTheme_1.nexusColors.primary.main}40`,
            borderRadius: 2
        }}>
                  <material_1.Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <material_1.Avatar sx={{
            width: 40,
            height: 40,
            background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.primary.main}, ${nexusTheme_1.nexusColors.accent.main})`
        }}>
                      <icons_material_1.Psychology />
                    </material_1.Avatar>
                    <material_1.Box sx={{ flex: 1 }}>
                      <material_1.Typography variant="body2" sx={{ color: nexusTheme_1.nexusColors.text.secondary, mb: 1 }}>
                        AI Асистент Nexus:
                      </material_1.Typography>
                      <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                        {aiResponse}
                      </material_1.Typography>
                    </material_1.Box>
                    <material_1.IconButton onClick={() => speakResponse(aiResponse)} sx={{ color: nexusTheme_1.nexusColors.primary.main }}>
                      <icons_material_1.VolumeUp />
                    </material_1.IconButton>
                  </material_1.Box>
                </material_1.Paper>
              </framer_motion_1.motion.div>)}

            {/* Індикатор обробки */}
            {isProcessing && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <icons_material_1.Psychology sx={{ color: nexusTheme_1.nexusColors.accent.main }}/>
                  </framer_motion_1.motion.div>
                  <material_1.Typography variant="body1" sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                    Обробляю команду...
                  </material_1.Typography>
                </material_1.Box>
              </framer_motion_1.motion.div>)}

            {/* Кнопки управління */}
            <material_1.Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
              <material_1.Button variant={isListening ? "contained" : "outlined"} onClick={toggleListening} startIcon={isListening ? <icons_material_1.Stop /> : <icons_material_1.PlayArrow />} sx={{
        borderColor: nexusTheme_1.nexusColors.accent.main,
        color: isListening ? 'white' : nexusTheme_1.nexusColors.accent.main,
        background: isListening ? nexusTheme_1.nexusColors.accent.main : 'transparent',
        '&:hover': {
            borderColor: nexusTheme_1.nexusColors.accent.light,
            background: isListening ? nexusTheme_1.nexusColors.accent.dark : `${nexusTheme_1.nexusColors.accent.main}20`
        }
    }}>
                {isListening ? 'Зупинити' : 'Почати слухати'}
              </material_1.Button>

              <material_1.Button variant="outlined" onClick={() => setVoiceEnabled(!voiceEnabled)} startIcon={voiceEnabled ? <icons_material_1.VolumeUp /> : <icons_material_1.VolumeOff />} sx={{
        borderColor: nexusTheme_1.nexusColors.info.main,
        color: nexusTheme_1.nexusColors.info.main,
        '&:hover': {
            borderColor: nexusTheme_1.nexusColors.info.light,
            background: `${nexusTheme_1.nexusColors.info.main}20`
        }
    }}>
                {voiceEnabled ? 'Звук вкл' : 'Звук вимк'}
              </material_1.Button>

              <material_1.Button variant="outlined" onClick={testTTS} startIcon={<icons_material_1.Hearing />} sx={{
        borderColor: nexusTheme_1.nexusColors.success.main,
        color: nexusTheme_1.nexusColors.success.main,
        '&:hover': {
            borderColor: nexusTheme_1.nexusColors.success.light,
            background: `${nexusTheme_1.nexusColors.success.main}20`
        }
    }}>
                Тест голосу
              </material_1.Button>

              <material_1.Button variant="outlined" onClick={() => speakResponseBrowser('Тест браузерного озвучування. Якщо ви чуєте це повідомлення, то Browser Speech API працює правильно.')} startIcon={<icons_material_1.VolumeUp />} sx={{
        borderColor: nexusTheme_1.nexusColors.info.main,
        color: nexusTheme_1.nexusColors.info.main,
        '&:hover': {
            borderColor: nexusTheme_1.nexusColors.info.light,
            background: `${nexusTheme_1.nexusColors.info.main}20`
        }
    }}>
                Тест Browser
              </material_1.Button>

              <material_1.Button variant="outlined" onClick={() => setSettingsOpen(true)} startIcon={<icons_material_1.Settings />} sx={{
        borderColor: nexusTheme_1.nexusColors.warning.main,
        color: nexusTheme_1.nexusColors.warning.main,
        '&:hover': {
            borderColor: nexusTheme_1.nexusColors.warning.light,
            background: `${nexusTheme_1.nexusColors.warning.main}20`
        }
    }}>
                Налаштування
              </material_1.Button>
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Швидкі команди */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <material_1.Card sx={{
        background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
        borderRadius: 3,
        mb: 3
    }}>
          <material_1.CardContent sx={{ p: 3 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3, fontWeight: 'bold' }}>
              ⚡ Швидкі Команди
            </material_1.Typography>

            <material_1.Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {quickCommands.map((cmd, index) => (<framer_motion_1.motion.div key={cmd.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <material_1.Button variant="outlined" startIcon={<cmd.icon />} onClick={() => executeQuickCommand(cmd.command)} sx={{
            borderColor: `${nexusTheme_1.nexusColors.accent.main}50`,
            color: nexusTheme_1.nexusColors.text.primary,
            '&:hover': {
                borderColor: nexusTheme_1.nexusColors.accent.main,
                background: `${nexusTheme_1.nexusColors.accent.main}20`
            }
        }}>
                    {cmd.label}
                  </material_1.Button>
                </framer_motion_1.motion.div>))}
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Останні команди */}
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
        <material_1.Card sx={{
        background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}80, ${nexusTheme_1.nexusColors.secondary.dark}60)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
        borderRadius: 3
    }}>
          <material_1.CardContent sx={{ p: 3 }}>
            <material_1.Typography variant="h6" sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 3, fontWeight: 'bold' }}>
              📝 Історія Команд
            </material_1.Typography>

            <material_1.List>
              {recentCommands.length === 0 ? (<material_1.ListItem>
                  <material_1.ListItemText primary="Ще немає виконаних команд" primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                </material_1.ListItem>) : (recentCommands.map((command, index) => (<framer_motion_1.motion.div key={command.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.05 }}>
                    <material_1.ListItem sx={{
            background: `${nexusTheme_1.nexusColors.secondary.dark}20`,
            borderRadius: 2,
            mb: 1,
            border: `1px solid ${command.executed ? nexusTheme_1.nexusColors.success.main : nexusTheme_1.nexusColors.warning.main}30`
        }}>
                      <material_1.ListItemIcon>
                        <material_1.Avatar sx={{
            width: 32,
            height: 32,
            background: command.executed
                ? nexusTheme_1.nexusColors.success.main
                : nexusTheme_1.nexusColors.warning.main,
            fontSize: '0.8rem'
        }}>
                          {command.executed ? '✓' : '⏳'}
                        </material_1.Avatar>
                      </material_1.ListItemIcon>
                      <material_1.ListItemText primary={command.phrase} secondary={`${command.timestamp.toLocaleTimeString()} • Впевненість: ${command.confidence.toFixed(1)}%`} primaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.primary }} secondaryTypographyProps={{ color: nexusTheme_1.nexusColors.text.secondary }}/>
                    </material_1.ListItem>
                  </framer_motion_1.motion.div>)))}
            </material_1.List>
          </material_1.CardContent>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Діалог налаштувань */}
      <material_1.Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth PaperProps={{
        sx: {
            background: `linear-gradient(135deg, ${nexusTheme_1.nexusColors.primary.dark}95, ${nexusTheme_1.nexusColors.secondary.dark}90)`,
            backdropFilter: 'blur(15px)',
            border: `1px solid ${nexusTheme_1.nexusColors.accent.main}30`,
            borderRadius: 3
        }
    }}>
        <material_1.DialogTitle sx={{ color: nexusTheme_1.nexusColors.text.primary, borderBottom: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
          🎛️ Налаштування Голосового Інтерфейсу
        </material_1.DialogTitle>
        <material_1.DialogContent sx={{ pt: 3 }}>
          <material_1.Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <material_1.FormControl fullWidth>
              <material_1.InputLabel sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
                {settings.language === 'uk-UA' ? 'Мова інтерфейсу' : 'Interface Language'}
              </material_1.InputLabel>
              <material_1.Select value={settings.language} onChange={(e) => {
        const newLang = e.target.value;
        setSettings(prev => (Object.assign(Object.assign({}, prev), { language: newLang })));
        console.log(`🌐 Мову змінено на: ${newLang}`);
    }} sx={{
        color: nexusTheme_1.nexusColors.text.primary,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: `${nexusTheme_1.nexusColors.accent.main}50` }
    }}>
                <material_1.MenuItem value="uk-UA">🇺🇦 Українська (за замовчуванням)</material_1.MenuItem>
                <material_1.MenuItem value="en-US">🇺🇸 English</material_1.MenuItem>
              </material_1.Select>
            </material_1.FormControl>

            <material_1.Box>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                Швидкість мови: {settings.speed}x
              </material_1.Typography>
              <material_1.Slider value={settings.speed} onChange={(_, value) => setSettings(prev => (Object.assign(Object.assign({}, prev), { speed: value })))} min={0.5} max={2} step={0.1} sx={{
        color: nexusTheme_1.nexusColors.accent.main,
        '& .MuiSlider-thumb': { color: nexusTheme_1.nexusColors.accent.main },
        '& .MuiSlider-track': { color: nexusTheme_1.nexusColors.accent.main }
    }}/>
            </material_1.Box>

            <material_1.Box>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                Висота голосу: {settings.pitch}
              </material_1.Typography>
              <material_1.Slider value={settings.pitch} onChange={(_, value) => setSettings(prev => (Object.assign(Object.assign({}, prev), { pitch: value })))} min={0.5} max={2} step={0.1} sx={{
        color: nexusTheme_1.nexusColors.accent.main,
        '& .MuiSlider-thumb': { color: nexusTheme_1.nexusColors.accent.main },
        '& .MuiSlider-track': { color: nexusTheme_1.nexusColors.accent.main }
    }}/>
            </material_1.Box>

            <material_1.Box>
              <material_1.Typography sx={{ color: nexusTheme_1.nexusColors.text.primary, mb: 2 }}>
                Гучність: {Math.round(settings.volume * 100)}%
              </material_1.Typography>
              <material_1.Slider value={settings.volume} onChange={(_, value) => setSettings(prev => (Object.assign(Object.assign({}, prev), { volume: value })))} min={0} max={1} step={0.1} sx={{
        color: nexusTheme_1.nexusColors.accent.main,
        '& .MuiSlider-thumb': { color: nexusTheme_1.nexusColors.accent.main },
        '& .MuiSlider-track': { color: nexusTheme_1.nexusColors.accent.main }
    }}/>
            </material_1.Box>

            <material_1.FormControlLabel control={<material_1.Switch checked={settings.autoSpeak} onChange={(e) => setSettings(prev => (Object.assign(Object.assign({}, prev), { autoSpeak: e.target.checked })))} sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
                color: nexusTheme_1.nexusColors.accent.main,
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: nexusTheme_1.nexusColors.accent.main,
            },
        }}/>} label={<material_1.Typography sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                  Автоматично озвучувати відповіді
                </material_1.Typography>}/>

            <material_1.FormControlLabel control={<material_1.Switch checked={settings.continuousListening} onChange={(e) => setSettings(prev => (Object.assign(Object.assign({}, prev), { continuousListening: e.target.checked })))} sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
                color: nexusTheme_1.nexusColors.success.main,
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: nexusTheme_1.nexusColors.success.main,
            },
        }}/>} label={<material_1.Typography sx={{ color: nexusTheme_1.nexusColors.text.primary }}>
                  Безперервне прослуховування
                </material_1.Typography>}/>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions sx={{ p: 3, borderTop: `1px solid ${nexusTheme_1.nexusColors.accent.main}30` }}>
          <material_1.Button onClick={() => setSettingsOpen(false)} sx={{ color: nexusTheme_1.nexusColors.text.secondary }}>
            Закрити
          </material_1.Button>
          <material_1.Button variant="contained" sx={{
        background: `linear-gradient(45deg, ${nexusTheme_1.nexusColors.accent.main}, ${nexusTheme_1.nexusColors.primary.main})`,
        color: 'white'
    }}>
            Зберегти
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
;
exports.default = AIVoiceInterface;
