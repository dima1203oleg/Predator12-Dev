# ⚡ ШВИДКА ІНСТРУКЦІЯ: MODEL & PROVIDER MANAGER

## 🎯 ЩО ЦЕ?

**Інтерактивний модуль для управління:**

- 🤖 Моделями AI (58+ безкоштовних)
- 👥 Агентами (30+)
- 🔑 Провайдерами та API ключами
- 🔄 Множинними акаунтами

---

## 🚀 ШВИДКИЙ СТАРТ

### Крок 1: Відкрити Dashboard

```bash
cd predator12-local/frontend
npm start
```

Перейти на: `http://localhost:3000`

### Крок 2: Знайти вкладку "Provider Manager"

```
Dashboard → AI Models → ⚙️ Provider Manager
```

---

## 📊 ОСНОВНІ ДІЇ

### 1️⃣ Перемикання між Models та Agents

```
┌──────────────────────────────────┐
│ 🤖 Models  |  👥 Agents          │
│     ▲          (click to switch) │
└──────────────────────────────────┘
```

**Що бачите:**

- **Models**: Reasoning, Code, Vision, Embed, Quick, Gen
- **Agents**: Core, Specialized, Data, Security

---

### 2️⃣ Фільтр по категоріях

```
[ All ] [ 🧠 Reasoning ] [ 💻 Code ] [ 👁️ Vision ] ...
```

**Як використовувати:**

1. Клікнути на категорію
2. Побачити тільки моделі цієї категорії
3. Додати нову модель через "Add Model"

---

### 3️⃣ Додати новий Provider Account

```
┌─────────────────────────────────────────┐
│  ➕ Add Provider Account                │
└─────────────────────────────────────────┘

1. Вибрати провайдера (OpenAI, Anthropic, Google...)
2. Назвати акаунт (Production, Development)
3. Вставити API ключ
4. (Опціонально) Custom API endpoint
5. Клік "Add Account"
```

**Приклад:**

```
Provider:      🤖 OpenAI
Account Name:  Production Account
API Key:       sk-proj-***************************
Endpoint:      https://api.openai.com/v1 (default)
Models:        gpt-4-turbo, gpt-4, gpt-3.5-turbo
```

---

### 4️⃣ Управління акаунтами

```
┌─────────────────────────────────────────────────────┐
│ 🤖 OpenAI                      [ 2 accounts ] [ 1 active ] │
│ ├─ Production Account                               │
│ │  └─ 🔑 sk-prod-***         [✓ Active] [✏️] [🗑️]    │
│ └─ Development Account                              │
│    └─ 🔑 sk-dev-***          [✗ Inactive] [✏️] [🗑️]  │
└─────────────────────────────────────────────────────┘
```

**Дії:**

- ✅ **Switch** - Активувати/Деактивувати
- ✏️ **Edit** - Редагувати налаштування
- 🗑️ **Delete** - Видалити акаунт
- 👁️ **Show/Hide** - Показати/Сховати API ключ

---

## 🔑 ДОДАВАННЯ ПРОВАЙДЕРІВ

### OpenAI

```yaml
Provider: OpenAI
Endpoint: https://api.openai.com/v1
Models:
  - gpt-4-turbo
  - gpt-4
  - gpt-3.5-turbo
  - dall-e-3
```

### Anthropic

```yaml
Provider: Anthropic
Endpoint: https://api.anthropic.com/v1
Models:
  - claude-3.5-sonnet
  - claude-3-opus
  - claude-3-haiku
```

### Google

```yaml
Provider: Google
Endpoint: https://generativelanguage.googleapis.com/v1
Models:
  - gemini-pro
  - gemini-2.0-flash
  - gemma-2-9b
```

### Mistral AI

```yaml
Provider: Mistral AI
Endpoint: https://api.mistral.ai/v1
Models:
  - mixtral-8x7b
  - mistral-large
  - mistral-nemo
```

---

## 📊 ПРИКЛАДИ ВИКОРИСТАННЯ

### Приклад 1: Налаштувати Production і Dev середовища

```
1. Додати OpenAI Production:
   └─ Account: "Production"
   └─ Key: sk-prod-***
   └─ Active: ✅

2. Додати OpenAI Development:
   └─ Account: "Development"
   └─ Key: sk-dev-***
   └─ Active: ❌ (use only when needed)
```

### Приклад 2: Тестувати різні провайдери

```
1. Додати OpenAI → Test GPT-4
2. Додати Anthropic → Test Claude 3.5
3. Додати Google → Test Gemini Pro
4. Порівняти результати
```

### Приклад 3: Fallback стратегія

```
Primary:   OpenAI (gpt-4-turbo)
Fallback1: Anthropic (claude-3.5-sonnet)
Fallback2: Google (gemini-pro)
Emergency: Meta (llama-3.1-70b) - FREE
```

---

## 🎨 UI ЕЛЕМЕНТИ

### Category Card

```
┌─────────────────────────────────┐
│ 🧠  Reasoning                   │
│     Складне міркування та аналіз│
│ ─────────────────────────────── │
│ [ 12 models ]  [ + Add Model ]  │
└─────────────────────────────────┘
```

### Provider Account

```
┌─────────────────────────────────────────┐
│ 🤖 Production Account                   │
│ 🔑 sk-prod-***                          │
│ 📊 Requests: 1,234                      │
│ 🤖 Models: gpt-4-turbo, gpt-4           │
│                     [✓] [✏️] [🗑️]       │
└─────────────────────────────────────────┘
```

---

## ⚠️ ВАЖЛИВО

### Безпека API ключів

```
✅ DO:
- Зберігати в .env файлах
- Використовувати різні ключі для prod/dev
- Ротація кожні 90 днів
- Never commit to Git

❌ DON'T:
- Показувати в логах
- Шарити публічно
- Використовувати один ключ для всього
```

### Rate Limits

```
OpenAI:
  - Free tier: 3 RPM
  - Tier 1: 60 RPM
  - Tier 5: 10,000 RPM

Anthropic:
  - Free tier: 5 RPM
  - Tier 1: 50 RPM

Google:
  - Free tier: 60 RPM
```

---

## 🔧 TROUBLESHOOTING

### Проблема: API ключ не працює

```
1. Перевірити формат ключа
   OpenAI:    sk-proj-***
   Anthropic: sk-ant-***
   Google:    AIza***

2. Перевірити баланс акаунту

3. Перевірити rate limits

4. Створити новий ключ
```

### Проблема: Модель не доступна

```
1. Перевірити підписку провайдера
2. Оновити список моделей
3. Використати fallback модель
```

### Проблема: Повільна відповідь

```
1. Переключитися на швидшу модель (Quick category)
2. Зменшити max_tokens
3. Використати регіональний endpoint
```

---

## 📈 СТАТИСТИКА

### Dashboard показує:

```
Provider Stats:
├─ Total Accounts: 5
├─ Active Accounts: 3
├─ Total Requests: 12,456
└─ Active Models: 18

Per Provider:
🤖 OpenAI
   ├─ Accounts: 2
   ├─ Active: 1
   └─ Requests: 5,678

🧬 Anthropic
   ├─ Accounts: 1
   ├─ Active: 1
   └─ Requests: 3,456
```

---

## ✅ CHECKLIST

### Перший запуск

- [ ] Відкрити Dashboard
- [ ] Перейти в Provider Manager
- [ ] Додати перший провайдер
- [ ] Протестувати API ключ
- [ ] Вибрати категорію
- [ ] Додати модель

### Production setup

- [ ] Створити production акаунти
- [ ] Налаштувати fallback стратегію
- [ ] Перевірити rate limits
- [ ] Встановити monitoring
- [ ] Налаштувати alerts

---

## 🎯 NEXT STEPS

1. **Експериментувати** з різними моделями
2. **Налаштувати** оптимальну конфігурацію
3. **Моніторити** використання та витрати
4. **Масштабувати** при необхідності

---

## 📞 ДОПОМОГА

**Документація:**

- [Повний гід](./📱_MODEL_PROVIDER_MANAGER_GUIDE.md)
- [Model Selection Logic](./MODEL_SELECTION_LOGIC_SPEC.md)
- [Agent Configuration](./AGENTS_30_COMPLETE_SPEC.md)

**Підтримка:**

- GitHub Issues
- Documentation
- Community Forum

---

**Версія**: 1.0.0  
**Статус**: ✅ Ready  
**Оновлено**: 2024
