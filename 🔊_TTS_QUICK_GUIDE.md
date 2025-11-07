# 🔊 TTS (TEXT-TO-SPEECH) - ШВИДКИЙ ГАЙД

## 🎯 ТЕСТУВАННЯ TTS

### На тестовій сторінці (test-speech-recognition.html):

1. **Оновіть сторінку** у браузері (F5 або Cmd+R)
2. Натисніть **"🔊 Тест TTS (Українська)"**
   - Має озвучити: "Привіт! Я тестую систему озвучування тексту..."
3. Натисніть **"🔊 Test TTS (English)"**
   - Має озвучити: "Hello! I am testing the text to speech system..."

---

## 🔍 ЩО ПЕРЕВІРИТИ

### У Console (DevTools):

```
🔊 Тестування TTS (Українська)...
🎤 Доступно голосів: 84
✅ Знайдено український голос: Google українська
🎵 Використовується голос: Google українська (uk-UA)
✅ speechSynthesis.speak() викликано
🔊 Початок озвучування: "Привіт! Я тестую систему озвучування тексту..."
✅ Озвучування завершено
```

---

## ❌ ТИПОВІ ПРОБЛЕМИ ТА РІШЕННЯ

### 1. "Голосів 0" або "Український голос не знайдено"

**Рішення A**: Почекайте завантаження голосів

```javascript
// У Console:
speechSynthesis.getVoices().length;
// Якщо 0 - почекайте 2-3 секунди, потім спробуйте знову
```

**Рішення B**: Перезавантажте сторінку

- Натисніть F5 або Cmd+R
- Почекайте 2-3 секунди
- Спробуйте знову

**Рішення C**: Перевірте браузер

- Chrome: ✅ Найкраща підтримка
- Edge: ✅ Добра підтримка
- Safari: ⚠️ Обмежена підтримка
- Firefox: ❌ Погана підтримка TTS

---

### 2. "Озвучування не працює" (без помилок)

**Перевірте гучність:**

- Системна гучність не на мінімумі
- Гучність браузера не на мінімумі
- Динаміки/навушники підключені

**Перевірте у Console:**

```javascript
// Простий тест:
const utterance = new SpeechSynthesisUtterance("Тест");
utterance.lang = "uk-UA";
speechSynthesis.speak(utterance);
```

---

### 3. "Помилка: synthesis-unavailable"

**Причина:** Speech Synthesis недоступний у браузері

**Рішення:**

- Використовуйте Chrome або Edge
- Оновіть браузер до останньої версії
- Перевірте, чи ввімкнено звук у системі

---

### 4. "Озвучує англійською замість української"

**Причина:** Немає українських голосів

**Рішення A**: Встановіть українські голоси (macOS)

1. System Settings → Accessibility → Spoken Content
2. System Voice → Manage Voices
3. Завантажте українські голоси (Lesya, Oleksandr)

**Рішення B**: Використайте Google Chrome

- Chrome має вбудовані Google голоси для всіх мов
- Не потрібно встановлювати системні голоси

---

### 5. "Розмитий/роботизований голос"

**Це нормально** для системних голосів!

**Покращення:**

- Використайте Chrome (Google Neural voices)
- Інтегруйте з Ultimate Voice API (Coqui TTS, Google Cloud TTS)
- Встановіть якісніші системні голоси

---

## 🎯 ДІАГНОСТИКА TTS

### Команди для DevTools Console:

```javascript
// 1. Перевірка підтримки
console.log("TTS доступний:", "speechSynthesis" in window);

// 2. Список всіх голосів
speechSynthesis.getVoices().forEach((voice, i) => {
  console.log(`${i}: ${voice.name} (${voice.lang})`);
});

// 3. Тільки українські голоси
speechSynthesis
  .getVoices()
  .filter((v) => v.lang.startsWith("uk"))
  .forEach((v) => console.log(v.name, v.lang));

// 4. Тільки англійські голоси
speechSynthesis
  .getVoices()
  .filter((v) => v.lang.startsWith("en"))
  .forEach((v) => console.log(v.name, v.lang));

// 5. Простий тест
const test = new SpeechSynthesisUtterance("Привіт");
test.lang = "uk-UA";
speechSynthesis.speak(test);

// 6. Зупинити все озвучування
speechSynthesis.cancel();

// 7. Перевірити статус
console.log("Speaking:", speechSynthesis.speaking);
console.log("Pending:", speechSynthesis.pending);
console.log("Paused:", speechSynthesis.paused);
```

---

## 🔧 ІНТЕГРАЦІЯ З REACT (AIVoiceInterface.tsx)

### Функція вже є: `speakResponseBrowser()`

```typescript
// Використання:
speakResponseBrowser("Привіт! Як справи?");
```

### Перевірка у React:

1. Запустіть frontend:

```bash
cd /Users/dima/Documents/Predator12/predator12-local/frontend
npm run dev
```

2. Відкрийте: http://localhost:5173
3. Перейдіть до: Voice Control Interface
4. Скажіть щось (STT)
5. AI має згенерувати відповідь
6. Якщо `autoSpeak` ввімкнено → озвучить відповідь

---

## 🎨 ULTIMATE VOICE API (Триступенева логіка)

### Якщо потрібен якісний TTS:

```bash
# 1. Запустіть Ultimate Voice API:
cd /Users/dima/Documents/Predator12/predator12-local
./start-voice-ultimate.sh

# 2. Перевірте:
curl http://localhost:8765/capabilities

# 3. TTS запит:
curl -X POST http://localhost:8765/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Привіт! Це тестове повідомлення.",
    "language": "uk",
    "provider": "auto"
  }'
```

### Fallback логіка:

1. **API Services** (Google Cloud TTS, AWS Polly) - якщо онлайн
2. **Local Models** (Coqui TTS, pyttsx3) - якщо офлайн
3. **Browser API** (speechSynthesis) - завжди доступний

---

## 📊 ПОРІВНЯННЯ ПРОВАЙДЕРІВ

| Провайдер        | Якість     | Швидкість  | Офлайн | Українська     |
| ---------------- | ---------- | ---------- | ------ | -------------- |
| Google Cloud TTS | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡   | ❌     | ✅ Нейронна    |
| AWS Polly        | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡   | ❌     | ✅ Neural      |
| Coqui TTS        | ⭐⭐⭐⭐   | ⚡⚡⚡     | ✅     | ✅ Багатомовна |
| pyttsx3          | ⭐⭐⭐     | ⚡⚡⚡⚡⚡ | ✅     | ⚠️ Системні    |
| Browser API      | ⭐⭐⭐     | ⚡⚡⚡⚡   | ✅     | ⚠️ Залежить    |

---

## ✅ ЧЕКЛИСТ TTS

- [ ] **Тест на test-speech-recognition.html** - кнопка "🔊 Тест TTS"
- [ ] **Перевірка голосів** - Console → `speechSynthesis.getVoices()`
- [ ] **Українська мова** - чи є українські голоси?
- [ ] **Англійська мова** - чи працює English?
- [ ] **Гучність** - системна та браузера
- [ ] **React інтеграція** - speakResponseBrowser() працює?
- [ ] **Ultimate API** - якщо потрібна краща якість

---

## 🎯 ШВИДКИЙ ТЕСТ

### 1. На тестовій сторінці:

```
1. Оновити сторінку (F5)
2. Натиснути "🔊 Тест TTS (Українська)"
3. Має озвучити українською ✅
4. Натиснути "🔊 Test TTS (English)"
5. Має озвучити англійською ✅
```

### 2. У DevTools Console:

```javascript
// Швидкий тест:
speechSynthesis.speak(new SpeechSynthesisUtterance("Тест TTS працює!"));
```

---

## 📞 ПІДТРИМКА

### Якщо TTS не працює:

1. **Перевірте Console** - є помилки?
2. **Перевірте голоси** - `speechSynthesis.getVoices().length > 0`?
3. **Перевірте браузер** - Chrome/Edge рекомендовані
4. **Перевірте гучність** - системна та браузера
5. **Спробуйте простий тест** - code snippet вище

### Документація:

- MDN: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- Chrome TTS: https://developer.chrome.com/docs/extensions/reference/tts/

---

**🔊 TTS готовий до тестування!**

**Дата:** 2024-10-10  
**Версія:** Predator12 Nexus Core V5.2  
**Статус:** ✅ ОНОВЛЕНО
