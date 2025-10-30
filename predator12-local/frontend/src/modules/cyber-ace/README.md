# 🤖 CYBER-ACE Module

## Огляд

**CYBER-ACE** (Cyber Analytics and Control Engine) — це головний AI-асистент системи PREDATOR12, який керує всіма AI-агентами та забезпечує інтуїтивну взаємодію з користувачем.

## Основні можливості

### 1. 3D Інтерактивний Аватар
- Анімований 3D аватар з Three.js
- Візуальні ефекти в залежності від стану (активний, слухає, говорить)
- Пульсація та частинки навколо аватара
- Smooth анімації та переходи

### 2. Голосове Управління
- Розпізнавання мови (Web Speech API)
- Підтримка української та англійської мов
- Real-time транскрипція
- Візуальні індикатори прослуховування

### 3. Система Агентів
- 6 спеціалізованих AI-агентів:
  - **Data Analyst** 📊 — аналіз даних
  - **Risk Detective** 🔍 — виявлення ризиків
  - **Network Scout** 🕸️ — дослідження мережі
  - **Compliance Guardian** 🛡️ — перевірка відповідності
  - **Threat Hunter** 🎯 — пошук загроз
  - **Pattern Finder** 🔮 — знаходження патернів

### 4. Швидкі Дії
- Попередньо налаштовані команди
- Одним кліком запускати аналіз
- Візуальні індикатори прогресу

### 5. Управління Станом
- Zustand для управління станом
- Persistent storage для налаштувань
- Real-time оновлення статусу агентів

## Структура Модуля

```
cyber-ace/
├── components/
│   ├── AceAvatar.tsx          # 3D аватар
│   ├── QuickActions.tsx       # Швидкі дії
│   ├── AgentCards.tsx         # Картки агентів
│   ├── StatusBar.tsx          # Статус-бар
│   ├── VoiceInput.tsx         # Голосовий ввід
│   └── index.ts               # Barrel export
├── state/
│   └── cyberAceStore.ts       # Zustand store
├── locales/
│   ├── uk-UA.json             # Українська локалізація
│   └── en-US.json             # Англійська локалізація
├── styles/
│   └── cyber-ace.css          # Стилі
├── i18n.ts                    # i18n конфігурація
└── CyberAcePage.tsx           # Головна сторінка
```

## Використання

### Основна інтеграція

```tsx
import { CyberAcePage } from './modules/cyber-ace/CyberAcePage';
import './modules/cyber-ace/styles/cyber-ace.css';

function App() {
  return <CyberAcePage />;
}
```

### Використання Store

```tsx
import { useCyberAceStore } from './modules/cyber-ace/state/cyberAceStore';

function MyComponent() {
  const { agents, currentAgent, setCurrentAgent } = useCyberAceStore();

  return (
    <div>
      {agents.map(agent => (
        <button onClick={() => setCurrentAgent(agent)}>
          {agent.name}
        </button>
      ))}
    </div>
  );
}
```

### Додавання Завдання

```tsx
const { addTask } = useCyberAceStore();

addTask({
  id: 'task-1',
  agentId: 'data-analyst-01',
  title: 'Аналіз даних за липень',
  description: 'Проаналізувати всі транзакції за липень 2024',
  status: 'pending',
  priority: 'high',
  createdAt: new Date(),
  completedAt: null
});
```

### Робота з Агентами

```tsx
const {
  agents,
  getAgentById,
  updateAgent,
  delegateTask
} = useCyberAceStore();

// Отримати агента
const analyst = getAgentById('data-analyst-01');

// Оновити статус
updateAgent('data-analyst-01', { status: 'busy' });

// Делегувати завдання
delegateTask('task-1', 'data-analyst-01');
```

## API

### CyberAceStore

#### Стан
- `isActive: boolean` — чи активний CYBER-ACE
- `systemStatus: SystemStatus` — статус системи
- `mood: AceMood` — настрій аватара
- `agents: Agent[]` — список агентів
- `currentAgent: Agent | null` — поточний агент
- `tasks: Task[]` — список завдань
- `notifications: Notification[]` — нотифікації
- `conversationHistory` — історія розмов

#### Дії
- `initializeAce()` — ініціалізація
- `setSystemStatus(status)` — встановити статус
- `setMood(mood)` — встановити настрій
- `addAgent(agent)` — додати агента
- `updateAgent(id, updates)` — оновити агента
- `addTask(task)` — додати завдання
- `completeTask(id, result)` — завершити завдання
- `delegateTask(taskId, agentId)` — делегувати завдання
- `addNotification(notification)` — додати нотифікацію
- `addMessage(role, content)` — додати повідомлення

## Типи

### Agent
```typescript
interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  status: AgentStatus;
  tasks: number;
  lastActive: Date | null;
  capabilities: string[];
  avatar: string;
}
```

### Task
```typescript
interface Task {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  completedAt: Date | null;
  result?: any;
}
```

## Локалізація

Модуль підтримує дві мови:
- Українська (`uk-UA`) — за замовчуванням
- Англійська (`en-US`)

Зміна мови:
```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <button onClick={() => i18n.changeLanguage('en-US')}>
      Switch to English
    </button>
  );
}
```

## Стилізація

Модуль використовує кастомні CSS змінні для кольорів:
- `--cyber-primary: #00ffff` — основний колір
- `--cyber-secondary: #0099ff` — вторинний колір
- `--cyber-danger: #e74c3c` — колір помилок
- `--cyber-success: #2ecc71` — колір успіху
- `--cyber-warning: #f39c12` — колір попереджень

## Анімації

Використовує Framer Motion для:
- Плавних переходів
- Stagger анімацій
- Hover ефектів
- Entrance/Exit анімацій

## Accessibility

- Клавіатурна навігація
- ARIA labels
- Screen reader підтримка
- Високий контраст
- Анімації можна вимкнути

## Performance

- Lazy loading компонентів
- Оптимізовані Three.js сцени
- Мемоізація важких обчислень
- Дебаунсінг голосового вводу

## Сумісність

- Chrome 90+
- Firefox 88+
- Safari 14+ (з обмеженнями Web Speech API)
- Edge 90+

## Наступні Кроки

1. ✅ Створити базову структуру модуля
2. ✅ Реалізувати 3D аватар
3. ✅ Додати голосове управління
4. ✅ Створити систему агентів
5. 🔄 Інтегрувати з бекенд API
6. 🔄 Додати AI обробку команд
7. 🔄 Реалізувати TTS відповіді
8. 🔄 Додати advanced features

## Автор

PREDATOR12 Development Team

## Ліцензія

Proprietary
