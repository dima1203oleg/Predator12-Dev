# 📱 MODEL & PROVIDER MANAGER - Повний Гід

## 🎯 ОГЛЯД

**Model & Provider Manager** - це комплексний UI модуль для керування:

1. ✅ **Категоріями моделей** (Reasoning, Code, Vision, Embed, Quick, Generation)
2. ✅ **Категоріями агентів** (Core, Specialized, Data, Security)
3. ✅ **Провайдерами** (OpenAI, Anthropic, Google, Mistral, Meta, Microsoft, Cohere, DeepSeek)
4. ✅ **Множинними акаунтами** від одного провайдера

---

## 🚀 ОСНОВНІ ФУНКЦІЇ

### 1️⃣ Перемикання між Models та Agents

```tsx
// Tabs для переключення режимів
<Tabs value={viewMode} onChange={(_, value) => setViewMode(value)}>
  <Tab value="models" label="🤖 Models" />
  <Tab value="agents" label="👥 Agents" />
</Tabs>
```

**Можливості:**
- 🔄 Швидке перемикання між моделями та агентами
- 📊 Автоматичне оновлення категорій
- 🎨 Плавна анімація переходів

---

### 2️⃣ Фільтрація по категоріях

**Model Categories:**
- 🧠 **Reasoning** (12 моделей) - Складне міркування
- 💻 **Code Generation** (10 моделей) - Генерація коду
- 👁️ **Vision** (8 моделей) - Розпізнавання зображень
- 🔗 **Embeddings** (6 моделей) - Векторні представлення
- ⚡ **Quick/Fast** (8 моделей) - Швидкі відповіді
- 🎨 **Generation** (4 моделей) - Генерація контенту

**Agent Categories:**
- ⚙️ **Core Agents** (5 агентів) - Основні системні
- 🎯 **Specialized** (10 агентів) - Спеціалізовані
- 📊 **Data Processing** (8 агентів) - Обробка даних
- 🔒 **Security** (4 агентів) - Безпека

```tsx
// Вибір категорії
<Chip
  label={`${category.icon} ${category.name} (${category.modelCount})`}
  onClick={() => setSelectedCategory(category.id)}
/>
```

---

### 3️⃣ Додавання провайдерів

**Підтримувані провайдери:**

| Провайдер | Іконка | Моделі | API Required |
|-----------|--------|--------|--------------|
| OpenAI | 🤖 | GPT-4, GPT-3.5, DALL-E | ✅ Yes |
| Anthropic | 🧬 | Claude 3.5, Claude 3 | ✅ Yes |
| Google | 🌐 | Gemini Pro, Gemma | ✅ Yes |
| Mistral AI | 🌀 | Mixtral, Mistral Large | ✅ Yes |
| Meta | 🦙 | Llama 3, Llama 4 | ❌ No |
| Microsoft | 🔷 | Phi-4, Azure OpenAI | ✅ Yes |
| Cohere | 🎯 | Command R+, Embed | ✅ Yes |
| DeepSeek | 🧠 | DeepSeek R1, V3 | ✅ Yes |

**Форма додавання:**
```tsx
interface NewProviderForm {
  providerId: string;         // ID провайдера
  accountName: string;        // Назва акаунту (Production/Dev)
  apiKey: string;             // API ключ
  apiEndpoint?: string;       // Endpoint (опціонально)
  models: string[];           // Список моделей
}
```

---

### 4️⃣ Множинні акаунти

**Приклад використання:**

```typescript
// Різні акаунти OpenAI
const accounts: ProviderAccount[] = [
  {
    id: '1',
    providerName: 'OpenAI',
    accountName: 'Production Account',
    apiKey: 'sk-prod-***',
    isActive: true,
    models: ['gpt-4-turbo', 'gpt-4']
  },
  {
    id: '2',
    providerName: 'OpenAI',
    accountName: 'Development Account',
    apiKey: 'sk-dev-***',
    isActive: false,
    models: ['gpt-3.5-turbo']
  }
];
```

**Функції для акаунтів:**
- ✅ **Активація/Деактивація** - Switch для вкл/викл
- ✏️ **Редагування** - Змінити налаштування
- 🗑️ **Видалення** - Повне видалення акаунту
- 👁️ **Перегляд API ключа** - Show/Hide функція
- 📊 **Статистика** - Кількість запитів

---

## 🎨 UI КОМПОНЕНТИ

### Category Cards

```tsx
<Card>
  <Stack spacing={2}>
    {/* Header */}
    <Stack direction="row" alignItems="center">
      <Typography variant="h2">{category.icon}</Typography>
      <Box>
        <Typography variant="h6">{category.name}</Typography>
        <Typography variant="body2">{category.description}</Typography>
      </Box>
    </Stack>

    {/* Stats */}
    <Chip label={`${category.modelCount} models`} />

    {/* Actions */}
    <Button endIcon={<AddIcon />}>
      Add Model
    </Button>
  </Stack>
</Card>
```

### Provider Accounts List

```tsx
<Accordion>
  <AccordionSummary>
    <Stack direction="row" spacing={2}>
      <Typography>{provider.icon} {provider.name}</Typography>
      <Badge badgeContent={stats.accounts} />
      <Chip label={`${stats.active} active`} />
    </Stack>
  </AccordionSummary>

  <AccordionDetails>
    <List>
      {accounts.map(account => (
        <ListItem>
          <ListItemText
            primary={account.accountName}
            secondary={
              <Stack>
                <Typography>🔑 {account.apiKey}</Typography>
                <Typography>📊 Requests: {account.requestCount}</Typography>
                <Typography>🤖 Models: {account.models.join(', ')}</Typography>
              </Stack>
            }
          />
          <ListItemSecondaryAction>
            <Switch checked={account.isActive} />
            <IconButton><EditIcon /></IconButton>
            <IconButton><DeleteIcon /></IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  </AccordionDetails>
</Accordion>
```

---

## 📊 ІНТЕРФЕЙСИ

### ProviderAccount

```typescript
interface ProviderAccount {
  id: string;                  // Унікальний ID
  providerName: string;        // Назва провайдера
  accountName: string;         // Назва акаунту
  apiKey: string;              // API ключ
  apiEndpoint?: string;        // Custom endpoint
  isActive: boolean;           // Статус активності
  addedAt: string;             // Дата додавання
  lastUsed?: string;           // Остання активність
  requestCount?: number;       // Кількість запитів
  models?: string[];           // Доступні моделі
}
```

### ModelCategory

```typescript
interface ModelCategory {
  id: string;                  // Унікальний ID
  name: string;                // Назва категорії
  icon: string;                // Emoji іконка
  description: string;         // Опис
  modelCount: number;          // Кількість моделей
}
```

### Provider

```typescript
interface Provider {
  id: string;                  // Унікальний ID
  name: string;                // Назва провайдера
  icon: string;                // Emoji іконка
  description: string;         // Опис та моделі
  requiresApiKey: boolean;     // Чи потрібен API ключ
  defaultEndpoint?: string;    // Стандартний endpoint
  supportedModels: string[];   // Підтримувані моделі
}
```

---

## 🔧 ІНТЕГРАЦІЯ

### 1. Імпорт компонента

```tsx
import ModelProviderManager from './components/models/ModelProviderManager';

function App() {
  return (
    <div>
      <ModelProviderManager />
    </div>
  );
}
```

### 2. Додати в main-full.tsx

```tsx
// В розділ AI Models
<Tab label="⚙️ Provider Manager" />

<TabPanel value={activeTab} index={3}>
  <ModelProviderManager />
</TabPanel>
```

### 3. Підключити до backend API

```typescript
// API endpoints
const API_ENDPOINTS = {
  // Provider accounts
  getAccounts: '/api/providers/accounts',
  addAccount: '/api/providers/accounts',
  updateAccount: '/api/providers/accounts/:id',
  deleteAccount: '/api/providers/accounts/:id',

  // Models
  getModels: '/api/models',
  addModel: '/api/models',

  // Categories
  getCategories: '/api/models/categories',
  getCategoryModels: '/api/models/categories/:id'
};
```

---

## 🎯 USE CASES

### Use Case 1: Додати новий OpenAI акаунт

```typescript
// 1. Натиснути "Add Provider Account"
// 2. Вибрати провайдера: OpenAI
// 3. Заповнити форму:
{
  accountName: "Production Account",
  apiKey: "sk-proj-***",
  apiEndpoint: "https://api.openai.com/v1",
  models: ["gpt-4-turbo", "gpt-4"]
}
// 4. Клік "Add Account"
```

### Use Case 2: Переключення між категоріями

```typescript
// 1. Вибрати вкладку "Models" або "Agents"
// 2. Клікнути на категорію (наприклад, "Reasoning")
// 3. Побачити всі моделі цієї категорії
// 4. Додати нову модель через кнопку "Add Model"
```

### Use Case 3: Управління акаунтами

```typescript
// Деактивувати акаунт
handleToggleAccount(accountId);

// Редагувати акаунт
handleEditAccount(account);

// Видалити акаунт
handleDeleteAccount(accountId);
```

---

## 📈 МЕТРИКИ ТА СТАТИСТИКА

### Provider Stats

```typescript
const providerStats = useMemo(() => {
  const stats = new Map();

  providerAccounts.forEach(account => {
    const current = stats.get(account.providerName) || {
      accounts: 0,
      active: 0,
      requests: 0
    };

    current.accounts++;
    if (account.isActive) current.active++;
    current.requests += account.requestCount || 0;

    stats.set(account.providerName, current);
  });

  return stats;
}, [providerAccounts]);
```

**Відображення:**
- 📊 Загальна кількість акаунтів
- ✅ Активні акаунти
- 📈 Загальна кількість запитів

---

## 🔐 БЕЗПЕКА

### API Keys Management

```typescript
// 1. Показ/Приховування ключів
const [showApiKey, setShowApiKey] = useState(false);

// 2. Захист від витоку
const maskedKey = showApiKey
  ? account.apiKey
  : '••••••••••••••••••••••••••';

// 3. Валідація формату
const validateApiKey = (key: string) => {
  // OpenAI: sk-proj-***
  // Anthropic: sk-ant-***
  // Google: AIza***
  return /^[a-zA-Z0-9_-]+$/.test(key);
};
```

**Рекомендації:**
- ❌ Ніколи не логувати API ключі
- ✅ Використовувати HTTPS
- ✅ Зберігати ключі в environment variables
- ✅ Ротація ключів раз на 90 днів

---

## 🎨 АНІМАЦІЇ

### Framer Motion

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Card animation
<motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  <Card>...</Card>
</motion.div>

// List animation
<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {item}
    </motion.div>
  ))}
</AnimatePresence>
```

---

## 📝 ТЕСТУВАННЯ

### Unit Tests

```typescript
describe('ModelProviderManager', () => {
  it('should switch between models and agents', () => {
    const { getByText } = render(<ModelProviderManager />);

    fireEvent.click(getByText('👥 Agents'));
    expect(getByText('Core Agents')).toBeInTheDocument();
  });

  it('should add new provider account', () => {
    const { getByText, getByLabelText } = render(<ModelProviderManager />);

    fireEvent.click(getByText('Add Provider Account'));
    fireEvent.change(getByLabelText('Account Name'), {
      target: { value: 'Test Account' }
    });
    // ...
  });

  it('should toggle account active status', () => {
    const account = { id: '1', isActive: true };
    const { getByRole } = render(<AccountListItem account={account} />);

    fireEvent.click(getByRole('switch'));
    expect(account.isActive).toBe(false);
  });
});
```

---

## 🚀 DEPLOYMENT

### 1. Build

```bash
cd predator12-local/frontend
npm run build
```

### 2. Environment Variables

```bash
# .env.production
REACT_APP_API_URL=https://api.predator12.io
REACT_APP_ENABLE_PROVIDER_MANAGER=true
```

### 3. Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📚 ДОДАТКОВІ РЕСУРСИ

### Документація
- [Model Registry Spec](./MODEL_SELECTION_LOGIC_SPEC.md)
- [Agent Configuration](./AGENTS_30_COMPLETE_SPEC.md)
- [API Documentation](./API_REFERENCE.md)

### Приклади
- [Provider Integration Examples](./examples/provider-integration.ts)
- [Model Selection Logic](./examples/model-selection.ts)

---

## ✅ CHECKLIST

- [x] Перемикання Models/Agents
- [x] Фільтрація по категоріях
- [x] Додавання провайдерів
- [x] Множинні акаунти
- [x] Управління API ключами
- [x] Статистика та метрики
- [x] Анімації та UI/UX
- [x] Безпека
- [x] Документація

---

**Створено**: 2024
**Версія**: 1.0.0
**Статус**: ✅ Production Ready
