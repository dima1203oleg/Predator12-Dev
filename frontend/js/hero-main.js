/**
 * Predator Analytics - Hero Main Script
 * Інтерактивний AI інтерфейс з голосовою взаємодією
 */

// Конфігурація
const CONFIG = {
    apiUrl: 'http://localhost:8000',
    endpoints: {
        chat: '/api/chat',
        events: '/api/events',
        network: '/api/network'
    },
    voice: {
        enabled: true,
        lang: 'uk-UA'
    }
};

// Глобальний стан
let state = {
    isProcessing: false,
    isSpeaking: false,
    isListening: false,
    messages: [],
    events: [],
    recognition: null,
    synthesis: window.speechSynthesis
};

// DOM елементи
const elements = {
    aiFace: document.getElementById('ai-face'),
    faceSvg: document.getElementById('face-svg'),
    leftEye: document.getElementById('left-eye'),
    rightEye: document.getElementById('right-eye'),
    mouth: document.getElementById('mouth'),
    aiHint: document.getElementById('ai-hint'),
    aiStatus: document.getElementById('ai-status'),
    chatFeed: document.getElementById('chat-feed'),
    chatInput: document.getElementById('chat-input'),
    chatSend: document.getElementById('chat-send'),
    chatVoice: document.getElementById('chat-voice'),
    agentEvents: document.getElementById('agent-events'),
    networkCanvas: document.getElementById('network-canvas'),
    loadingModal: document.getElementById('loading-modal')
};

/**
 * Ініціалізація додатку
 */
function init() {
    console.log('🚀 Ініціалізація Predator Analytics Hero...');
    
    // Налаштування обробників подій
    setupEventListeners();
    
    // Ініціалізація голосового розпізнавання
    initVoiceRecognition();
    
    // Підключення до SSE для подій агентів
    connectToEventStream();
    
    // Анімація очей
    startEyeAnimation();
    
    // Перше повідомлення
    updateStatus('Готовий до роботи', 'ready');
    
    console.log('✅ Predator Analytics готовий!');
}

/**
 * Налаштування обробників подій
 */
function setupEventListeners() {
    // Відправка повідомлення
    elements.chatSend.addEventListener('click', () => sendMessage());
    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Голосове введення
    elements.chatVoice.addEventListener('click', toggleVoiceRecognition);
    
    // Фокус на input при завантаженні
    elements.chatInput.focus();
}

/**
 * Відправка повідомлення
 */
async function sendMessage() {
    const text = elements.chatInput.value.trim();
    if (!text || state.isProcessing) return;
    
    // Додати повідомлення користувача
    addMessage(text, 'user');
    elements.chatInput.value = '';
    
    // Оновити статус
    state.isProcessing = true;
    updateStatus('Обробляю запит...', 'processing');
    setEmotion('thinking');
    showLoading(true);
    
    try {
        // Відправити запит на бекенд
        const response = await fetch(`${CONFIG.apiUrl}${CONFIG.endpoints.chat}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                trace: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Додати відповідь AI
        const reply = data.reply || data.response || 'Отримано відповідь від системи.';
        addMessage(reply, 'assistant');
        
        // Голосова відповідь
        if (CONFIG.voice.enabled) {
            speakText(reply);
        }
        
        // Оновити граф якщо є дані
        if (data.networkData) {
            updateNetwork(data.networkData);
        }
        
        // Успішний статус
        setEmotion('happy');
        updateStatus('Відповідь готова', 'ready');
        
    } catch (error) {
        console.error('Помилка відправки повідомлення:', error);
        addMessage('⚠️ Не вдалося зв\'язатися з системою. Перевірте підключення.', 'system');
        setEmotion('sad');
        updateStatus('Помилка з\'єднання', 'error');
    } finally {
        state.isProcessing = false;
        showLoading(false);
        setTimeout(() => {
            if (!state.isSpeaking) {
                setEmotion('neutral');
            }
        }, 2000);
    }
}

/**
 * Додати повідомлення в чат
 */
function addMessage(text, type = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `msg ${type}`;
    messageDiv.textContent = text;
    
    elements.chatFeed.appendChild(messageDiv);
    elements.chatFeed.scrollTop = elements.chatFeed.scrollHeight;
    
    state.messages.push({ text, type, timestamp: Date.now() });
}

/**
 * Встановити емоцію AI обличчя
 */
function setEmotion(emotion) {
    const emotions = ['neutral', 'happy', 'thinking', 'speaking', 'sad', 'surprised'];
    elements.aiFace.classList.remove(...emotions);
    elements.aiFace.classList.add(emotion);
    
    // Оновити підказку
    const hints = {
        neutral: 'Готовий відповісти... 🤖',
        happy: 'Раді допомогти! 😊',
        thinking: 'Аналізую запит... 🤔',
        speaking: 'Відповідаю... 🗣️',
        sad: 'Виникла проблема... 😢',
        surprised: 'Цікаво! 😮'
    };
    elements.aiHint.textContent = hints[emotion] || hints.neutral;
}

/**
 * Оновити статус системи
 */
function updateStatus(text, status = 'ready') {
    const statusText = elements.aiStatus.querySelector('.status-text');
    const statusDot = elements.aiStatus.querySelector('.status-dot');
    
    statusText.textContent = text;
    
    // Колір точки
    const colors = {
        ready: '#00FF88',
        processing: '#18FFFF',
        error: '#FF4444'
    };
    
    statusDot.style.background = colors[status] || colors.ready;
    statusDot.style.boxShadow = `0 0 10px ${colors[status] || colors.ready}`;
}

/**
 * Показати/сховати модальне вікно завантаження
 */
function showLoading(show) {
    if (show) {
        elements.loadingModal.classList.remove('hidden');
        elements.loadingModal.style.display = 'flex';
    } else {
        elements.loadingModal.classList.add('hidden');
        elements.loadingModal.style.display = 'none';
    }
}

/**
 * Голосовий синтез (TTS)
 */
function speakText(text) {
    if (!state.synthesis) return;
    
    // Зупинити попереднє мовлення
    state.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = CONFIG.voice.lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
        state.isSpeaking = true;
        setEmotion('speaking');
    };
    
    utterance.onend = () => {
        state.isSpeaking = false;
        setEmotion('neutral');
    };
    
    utterance.onerror = () => {
        state.isSpeaking = false;
        setEmotion('neutral');
    };
    
    state.synthesis.speak(utterance);
}

/**
 * Ініціалізація голосового розпізнавання (STT)
 */
function initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn('Голосове розпізнавання не підтримується браузером');
        elements.chatVoice.disabled = true;
        elements.chatVoice.title = 'Не підтримується браузером';
        return;
    }
    
    state.recognition = new SpeechRecognition();
    state.recognition.lang = CONFIG.voice.lang;
    state.recognition.interimResults = false;
    state.recognition.maxAlternatives = 1;
    
    state.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.chatInput.value = transcript;
        sendMessage();
    };
    
    state.recognition.onerror = (event) => {
        console.error('Помилка розпізнавання:', event.error);
        state.isListening = false;
        elements.chatVoice.textContent = '🎙️';
        updateStatus('Готовий до роботи', 'ready');
    };
    
    state.recognition.onend = () => {
        state.isListening = false;
        elements.chatVoice.textContent = '🎙️';
    };
}

/**
 * Перемикання голосового введення
 */
function toggleVoiceRecognition() {
    if (!state.recognition) return;
    
    if (state.isListening) {
        state.recognition.stop();
        state.isListening = false;
        elements.chatVoice.textContent = '🎙️';
        updateStatus('Готовий до роботи', 'ready');
    } else {
        try {
            state.recognition.start();
            state.isListening = true;
            elements.chatVoice.textContent = '🔴';
            updateStatus('Слухаю...', 'processing');
        } catch (error) {
            console.error('Не вдалося запустити розпізнавання:', error);
        }
    }
}

/**
 * Підключення до Server-Sent Events для подій агентів
 */
function connectToEventStream() {
    try {
        const eventSource = new EventSource(`${CONFIG.apiUrl}${CONFIG.endpoints.events}`);
        
        eventSource.onmessage = (event) => {
            const data = event.data;
            addAgentEvent(data);
        };
        
        eventSource.onerror = (error) => {
            console.warn('SSE з\'єднання закрито або помилка:', error);
            eventSource.close();
            
            // Спроба перепідключення через 5 секунд
            setTimeout(connectToEventStream, 5000);
        };
        
        console.log('✅ Підключено до потоку подій агентів');
    } catch (error) {
        console.error('Не вдалося підключитися до SSE:', error);
    }
}

/**
 * Додати подію агента
 */
function addAgentEvent(eventText) {
    const li = document.createElement('li');
    li.textContent = eventText;
    
    elements.agentEvents.insertBefore(li, elements.agentEvents.firstChild);
    
    // Зберігати тільки останні 10 подій
    while (elements.agentEvents.children.length > 10) {
        elements.agentEvents.removeChild(elements.agentEvents.lastChild);
    }
    
    state.events.push({ text: eventText, timestamp: Date.now() });
}

/**
 * Оновити візуалізацію мережі
 */
function updateNetwork(networkData) {
    // TODO: Інтеграція з Cytoscape або D3.js
    console.log('Оновлення мережі:', networkData);
    
    // Поки що показуємо повідомлення
    elements.networkCanvas.innerHTML = `
        <div class="network-placeholder">
            <div class="placeholder-icon">✅</div>
            <div class="placeholder-text">Граф оновлено: ${networkData.nodes?.length || 0} вузлів</div>
        </div>
    `;
}

/**
 * Анімація очей (миготіння)
 */
function startEyeAnimation() {
    setInterval(() => {
        // Миготіння кожні 3-5 секунд
        if (Math.random() > 0.7) {
            [elements.leftEye, elements.rightEye].forEach(eye => {
                eye.style.opacity = '0.3';
                setTimeout(() => {
                    eye.style.opacity = '1';
                }, 150);
            });
        }
    }, 3000);
}

/**
 * Експорт для глобального доступу
 */
window.PredatorHero = {
    sendMessage,
    setEmotion,
    updateStatus,
    speakText,
    addMessage,
    state
};

// Ініціалізація при завантаженні DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Експорт модуля
export { init, sendMessage, setEmotion, updateStatus };
