/**
 * Chat Interface - Керує спілкуванням з AI
 * Обробляє повідомлення, відповіді та інтеграцію з AI обличчям
 */

class ChatInterface {
    constructor(options = {}) {
        this.messagesContainer = document.getElementById('chatMessages');
        this.inputField = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.aiFace = options.aiFace || null;
        
        this.messages = [];
        this.isProcessing = false;
        this.conversationId = this.generateId();
        
        // Налаштування голосового синтезу
        this.speechSynthesis = window.speechSynthesis;
        this.voiceEnabled = options.voiceEnabled || false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayWelcomeMessage();
        
        console.log('Chat Interface initialized');
    }

    setupEventListeners() {
        // Відправка по Enter
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Відправка по кліку
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Автофокус на поле вводу
        this.inputField.addEventListener('blur', () => {
            setTimeout(() => this.inputField.focus(), 100);
        });

        // Анімація при наборі
        this.inputField.addEventListener('input', () => {
            if (this.aiFace && this.inputField.value.length > 0) {
                this.aiFace.setEmotion('thinking');
            } else if (this.aiFace) {
                this.aiFace.setEmotion('neutral');
            }
        });
    }

    displayWelcomeMessage() {
        const welcomeMessage = {
            text: "Вітаю! Predator Analytics готовий до роботи. Чим можу допомогти?",
            sender: 'ai',
            timestamp: new Date(),
            type: 'welcome'
        };
        
        this.addMessage(welcomeMessage);
        
        // Показати емоцію привітання на обличчі
        if (this.aiFace) {
            this.aiFace.setEmotion('happy');
            setTimeout(() => {
                this.aiFace.setEmotion('neutral');
            }, 2000);
        }
    }

    async sendMessage() {
        const messageText = this.inputField.value.trim();
        
        if (!messageText || this.isProcessing) return;
        
        // Очистити поле вводу
        this.inputField.value = '';
        
        // Додати повідомлення користувача
        const userMessage = {
            text: messageText,
            sender: 'user',
            timestamp: new Date(),
            type: 'message'
        };
        
        this.addMessage(userMessage);
        
        // Показати що AI обробляє
        this.setProcessingState(true);
        
        try {
            // Відправити на обробку AI
            const response = await this.processWithAI(messageText);
            
            // Додати відповідь AI
            const aiMessage = {
                text: response.text,
                sender: 'ai',
                timestamp: new Date(),
                type: 'response',
                metadata: response.metadata || {}
            };
            
            this.addMessage(aiMessage);
            
            // Синтезувати голос якщо увімкнено
            if (this.voiceEnabled) {
                this.speakText(response.text);
            }
            
        } catch (error) {
            console.error('Error processing message:', error);
            
            const errorMessage = {
                text: "Вибачте, виникла помилка при обробці запиту. Спробуйте ще раз.",
                sender: 'ai',
                timestamp: new Date(),
                type: 'error'
            };
            
            this.addMessage(errorMessage);
        } finally {
            this.setProcessingState(false);
        }
    }

    async processWithAI(messageText) {
        // Симуляція обробки AI (замінити на реальний API)
        return new Promise((resolve) => {
            setTimeout(() => {
                const responses = this.generateResponse(messageText);
                resolve(responses);
            }, 1000 + Math.random() * 2000); // 1-3 секунди
        });
    }

    generateResponse(input) {
        const inputLower = input.toLowerCase();
        
        // Аналіз команд
        if (inputLower.includes('аналіз') || inputLower.includes('проаналізуй')) {
            return {
                text: "Починаю аналіз даних... Сканую цільовий об'єкт...\n\nАналіз завершено. Виявлено 4 об'єкти:\n• 2 підозрілі зв'язки\n• 1 офшорна структура  \n• 1 конкурент\n\nДетальніше?",
                metadata: {
                    action: 'analysis',
                    emotion: 'processing',
                    results: {
                        objects_found: 4,
                        suspicious_links: 2,
                        offshore: 1,
                        competitors: 1
                    }
                }
            };
        }
        
        if (inputLower.includes('статус') || inputLower.includes('стан')) {
            return {
                text: "Система активна. Режим: analytical\nCPU: 45% | RAM: 62%\nМережа: online\nВиконано аналізів: 127\n\nВсе працює в штатному режимі.",
                metadata: {
                    action: 'status',
                    emotion: 'neutral'
                }
            };
        }
        
        if (inputLower.includes('мережа') || inputLower.includes("зв'язки")) {
            return {
                text: "Виявлено зв'язків: 3\nІдентифіковано: 4 суб'єкти\nЗнайдено 1 високоризиковий об'єкт\n\n⚠️ Контрагент X пов'язаний із санкційною фірмою",
                metadata: {
                    action: 'network',
                    emotion: 'alert',
                    network_data: {
                        connections: 3,
                        entities: 4,
                        high_risk: 1
                    }
                }
            };
        }
        
        if (inputLower.includes('ризик') || inputLower.includes('загроза')) {
            return {
                text: "ВИЯВЛЕНО РИЗИКИ: 1\n\n⚠️ Контрагент X: Пов'язаний із санкційною фірмою\n   Деталі: Хабар 5000$ реєстр Prozorro\n\nРекомендую детальну перевірку.",
                metadata: {
                    action: 'threat_analysis',
                    emotion: 'alert',
                    threats: [
                        {
                            entity: 'Контрагент X',
                            risk_level: 'high',
                            amount: '5000$'
                        }
                    ]
                }
            };
        }
        
        if (inputLower.includes('допомога') || inputLower.includes('команди')) {
            return {
                text: "Доступні команди:\n\n• аналіз - Запустити аналіз даних\n• статус - Показати статус системи\n• мережа - Показати мережеві зв'язки\n• ризики - Виявити ризики\n• звіт - Згенерувати звіт\n• допомога - Ця довідка",
                metadata: {
                    action: 'help',
                    emotion: 'neutral'
                }
            };
        }
        
        // Загальна відповідь
        const genericResponses = [
            "Розумію. Аналізую ваш запит...",
            "Обробляю інформацію. Одну хвилину...",
            "Цікавий запит. Шукаю відповідь...",
            "Хороше питання. Дозвольте перевірити...",
            "Аналізую дані за вашим запитом..."
        ];
        
        return {
            text: genericResponses[Math.floor(Math.random() * genericResponses.length)],
            metadata: {
                action: 'general',
                emotion: 'thinking'
            }
        };
    }

    addMessage(message) {
        this.messages.push(message);
        
        const messageElement = this.createMessageElement(message);
        this.messagesContainer.appendChild(messageElement);
        
        // Автоскрол вниз
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // Анімація появи
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 10);
        
        // Оновити емоцію AI обличчя
        if (message.sender === 'ai' && this.aiFace && message.metadata) {
            const emotion = message.metadata.emotion || 'neutral';
            this.aiFace.setEmotion(emotion);
            
            if (message.metadata.action === 'analysis') {
                this.aiFace.startProcessing();
                setTimeout(() => {
                    this.aiFace.stopProcessing();
                }, 3000);
            }
        }
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message.text;
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';
        
        const senderSpan = document.createElement('span');
        senderSpan.className = 'sender';
        senderSpan.textContent = message.sender === 'ai' ? 'AI Assistant' : 'Користувач';
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        timeSpan.textContent = this.formatTime(message.timestamp);
        
        metaDiv.appendChild(senderSpan);
        metaDiv.appendChild(timeSpan);
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(metaDiv);
        
        return messageDiv;
    }

    setProcessingState(isProcessing) {
        this.isProcessing = isProcessing;
        
        if (isProcessing) {
            // Показати індикатор набору
            this.showTypingIndicator();
            
            // AI думає
            if (this.aiFace) {
                this.aiFace.startThinking();
            }
            
            // Заблокувати інтерфейс
            this.inputField.disabled = true;
            this.sendButton.disabled = true;
        } else {
            // Приховати індикатор
            this.hideTypingIndicator();
            
            // AI перестає думати
            if (this.aiFace) {
                this.aiFace.stopThinking();
            }
            
            // Розблокувати інтерфейс
            this.inputField.disabled = false;
            this.sendButton.disabled = false;
            this.inputField.focus();
        }
    }

    showTypingIndicator() {
        const existingIndicator = document.querySelector('.typing-indicator');
        if (existingIndicator) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    speakText(text) {
        if (!this.speechSynthesis) return;
        
        // Зупинити попереднє мовлення
        this.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'uk-UA';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        
        // Анімація губ під час мовлення
        utterance.onstart = () => {
            if (this.aiFace) {
                this.aiFace.speak(text);
            }
        };
        
        utterance.onend = () => {
            if (this.aiFace) {
                this.aiFace.setEmotion('neutral');
            }
        };
        
        this.speechSynthesis.speak(utterance);
    }

    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        console.log(`Voice synthesis ${this.voiceEnabled ? 'enabled' : 'disabled'}`);
        return this.voiceEnabled;
    }

    formatTime(date) {
        return date.toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    generateId() {
        return 'conv_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    clear() {
        this.messages = [];
        this.messagesContainer.innerHTML = '';
        this.displayWelcomeMessage();
    }

    exportConversation() {
        const conversation = {
            id: this.conversationId,
            timestamp: new Date().toISOString(),
            messages: this.messages
        };
        
        const dataStr = JSON.stringify(conversation, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `conversation_${this.conversationId}.json`;
        link.click();
    }
}

// Експорт для використання
window.ChatInterface = ChatInterface;
