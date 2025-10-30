/**
 * Predator12 - Головний модуль ініціалізації
 * Інтеграція всіх компонентів: AI Face, Chat Interface, Network Graph
 */

class Predator12App {
    constructor() {
        this.aiFace = null;
        this.chatInterface = null;
        this.networkGraph = null;
        this.isInitialized = false;
        this.currentAnalysisData = null;

        // Конфігурація додатку
        this.config = {
            api: {
                baseUrl: '/api/v1',
                endpoints: {
                    analyze: '/analyze',
                    chat: '/chat',
                    network: '/network'
                }
            },
            ui: {
                theme: 'dark',
                language: 'uk',
                animations: true
            }
        };
    }

    /**
     * Ініціалізація всього додатку
     */
    async init() {
        try {
            console.log('🚀 Ініціалізація Predator12...');

            // Перевірка наявності необхідних контейнерів
            this.validateContainers();

            // Ініціалізація компонентів
            await this.initializeComponents();

            // Налаштування взаємодії між компонентами
            this.setupComponentIntegration();

            // Завантаження початкових даних
            await this.loadInitialData();

            // Налаштування обробників подій
            this.setupEventHandlers();

            this.isInitialized = true;
            console.log('✅ Predator12 успішно ініціалізовано');

            // Показ привітального повідомлення
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ Помилка ініціалізації Predator12:', error);
            this.showErrorMessage('Помилка ініціалізації системи');
        }
    }

    /**
     * Перевірка наявності необхідних DOM контейнерів
     */
    validateContainers() {
        const requiredContainers = [
            'ai-face-container',
            'chat-container',
            'network-container'
        ];

        for (const containerId of requiredContainers) {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Контейнер ${containerId} не знайдено`);
            }
        }
    }

    /**
     * Ініціалізація всіх компонентів
     */
    async initializeComponents() {
        // Ініціалізація AI Face
        console.log('🎭 Ініціалізація AI Face...');
        this.aiFace = new window.AIFace('ai-face-container');
        await this.aiFace.init();

        // Ініціалізація Chat Interface
        console.log('💬 Ініціалізація Chat Interface...');
        this.chatInterface = new window.ChatInterface('chat-container', {
            aiFace: this.aiFace,
            apiUrl: this.config.api.baseUrl + this.config.api.endpoints.chat
        });
        await this.chatInterface.init();

        // Ініціалізація Network Graph
        console.log('🕸️ Ініціалізація Network Graph...');
        this.networkGraph = new window.NetworkGraph('network-container');
        await this.networkGraph.init();
    }

    /**
     * Налаштування взаємодії між компонентами
     */
    setupComponentIntegration() {
        // Інтеграція чату з AI обличчям
        this.chatInterface.on('messageProcessing', () => {
            this.aiFace.setEmotion('thinking');
        });

        this.chatInterface.on('messageResponse', (response) => {
            this.aiFace.setEmotion('speaking');

            // Якщо відповідь містить дані для мережі
            if (response.networkData) {
                this.networkGraph.updateData(response.networkData);
            }
        });

        this.chatInterface.on('messageComplete', () => {
            this.aiFace.setEmotion('neutral');
        });

        // Інтеграція мережі з чатом
        this.networkGraph.on('nodeClick', (nodeData) => {
            const message = `Розкажи детальніше про: ${nodeData.label}`;
            this.chatInterface.addMessage(message, 'user');
        });

        this.networkGraph.on('connectionClick', (connectionData) => {
            const message = `Поясни зв'язок між ${connectionData.source} та ${connectionData.target}`;
            this.chatInterface.addMessage(message, 'user');
        });
    }

    /**
     * Завантаження початкових даних
     */
    async loadInitialData() {
        try {
            // Завантаження демо даних для мережі
            const demoNetworkData = {
                nodes: [
                    { id: 'data1', label: 'Вхідні дані', type: 'input', x: 100, y: 100 },
                    { id: 'process1', label: 'Обробка', type: 'process', x: 300, y: 100 },
                    { id: 'output1', label: 'Результат', type: 'output', x: 500, y: 100 }
                ],
                links: [
                    { source: 'data1', target: 'process1', weight: 1 },
                    { source: 'process1', target: 'output1', weight: 1 }
                ]
            };

            this.networkGraph.updateData(demoNetworkData);

        } catch (error) {
            console.warn('⚠️ Не вдалося завантажити початкові дані:', error);
        }
    }

    /**
     * Налаштування глобальних обробників подій
     */
    setupEventHandlers() {
        // Обробник зміни розміру вікна
        window.addEventListener('resize', () => {
            if (this.networkGraph) {
                this.networkGraph.resize();
            }
            if (this.aiFace) {
                this.aiFace.resize();
            }
        });

        // Обробник клавіатурних скорочень
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Обробник помилок
        window.addEventListener('error', (event) => {
            console.error('💥 Глобальна помилка:', event.error);
            this.showErrorMessage('Виникла непередбачена помилка');
        });
    }

    /**
     * Обробка клавіатурних скорочень
     */
    handleKeyboardShortcuts(event) {
        // Ctrl+Enter - відправити повідомлення в чаті
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.chatInterface.submitCurrentMessage();
        }

        // Escape - скинути емоцію AI обличчя
        if (event.key === 'Escape') {
            this.aiFace.setEmotion('neutral');
        }

        // F1 - показати довідку
        if (event.key === 'F1') {
            event.preventDefault();
            this.showHelp();
        }
    }

    /**
     * Показ привітального повідомлення
     */
    showWelcomeMessage() {
        this.aiFace.setEmotion('happy');

        const welcomeMessage = `
            Вітаю в системі Predator12! 🎯

            Я ваш AI помічник для аналізу даних. Ось що я можу:
            • Обробляти та аналізувати ваші дані
            • Візуалізувати мережі зв'язків
            • Відповідати на питання про результати
            • Надавати детальні пояснення

            Просто напишіть мені повідомлення або завантажте дані для аналізу!
        `;

        this.chatInterface.addMessage(welcomeMessage.trim(), 'assistant');

        setTimeout(() => {
            this.aiFace.setEmotion('neutral');
        }, 3000);
    }

    /**
     * Показ повідомлення про помилку
     */
    showErrorMessage(message) {
        this.aiFace.setEmotion('sad');
        this.chatInterface.addMessage(`❌ ${message}`, 'system');

        setTimeout(() => {
            this.aiFace.setEmotion('neutral');
        }, 3000);
    }

    /**
     * Показ довідки
     */
    showHelp() {
        const helpMessage = `
            📚 Довідка Predator12:

            Клавіатурні скорочення:
            • Ctrl+Enter - відправити повідомлення
            • Escape - скинути емоцію
            • F1 - показати довідку

            Взаємодія:
            • Клікніть на вузол мережі для деталей
            • Натисніть на зв'язок для пояснення
            • Використовуйте чат для запитань

            Емоції AI:
            • 😐 Нейтральний - очікування
            • 🤔 Думає - обробка запиту
            • 😊 Радісний - успішний результат
            • 😮 Здивований - несподіваний результат
            • 😢 Сумний - помилка
        `;

        this.chatInterface.addMessage(helpMessage.trim(), 'system');
    }

    /**
     * Обробка завантаження файлу для аналізу
     */
    async analyzeFile(file) {
        try {
            this.aiFace.setEmotion('thinking');
            this.chatInterface.addMessage(`📁 Аналізую файл: ${file.name}`, 'system');

            // Формування даних для відправки
            const formData = new FormData();
            formData.append('file', file);

            // Відправка на аналіз
            const response = await fetch(this.config.api.baseUrl + this.config.api.endpoints.analyze, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            this.currentAnalysisData = result;

            // Оновлення мережі з результатами
            if (result.networkData) {
                this.networkGraph.updateData(result.networkData);
            }

            // Показ результатів в чаті
            this.aiFace.setEmotion('happy');
            this.chatInterface.addMessage(`✅ Аналіз завершено! Знайдено ${result.summary || 'дані для обробки'}.`, 'assistant');

        } catch (error) {
            console.error('Помилка аналізу файлу:', error);
            this.aiFace.setEmotion('sad');
            this.chatInterface.addMessage(`❌ Помилка аналізу: ${error.message}`, 'system');
        } finally {
            setTimeout(() => {
                this.aiFace.setEmotion('neutral');
            }, 3000);
        }
    }

    /**
     * Отримання поточного стану системи
     */
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            components: {
                aiFace: !!this.aiFace,
                chatInterface: !!this.chatInterface,
                networkGraph: !!this.networkGraph
            },
            hasData: !!this.currentAnalysisData
        };
    }
}

// Глобальна ініціалізація при завантаженні сторінки
let predator12App = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        predator12App = new Predator12App();
        await predator12App.init();

        // Експорт для глобального доступу
        window.Predator12 = predator12App;

    } catch (error) {
        console.error('Критична помилка ініціалізації:', error);

        // Показ fallback інтерфейсу
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #1a1a1a; color: #fff; font-family: Arial, sans-serif;">
                <div style="text-align: center;">
                    <h1>⚠️ Помилка ініціалізації Predator12</h1>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #007acc; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Спробувати знову
                    </button>
                </div>
            </div>
        `;
    }
});

// Експорт класу для використання в інших модулях
window.Predator12App = Predator12App;
