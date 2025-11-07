# 🎤 AIVoiceInterface - Технічна Специфікація

## 📊 Огляд Компонента

**Компонент:** `AIVoiceInterface.tsx`  
**Розташування:** `/predator12-local/frontend/src/components/voice/`  
**Тип:** React Functional Component  
**Мова:** TypeScript  
**UI Framework:** Material-UI (MUI) + Framer Motion

---

## 🏗️ Архітектура

### Залежності

```typescript
// Core React
import React, { useState, useEffect, useRef } from 'react';

// Animation
import { motion, AnimatePresence } from 'framer-motion';

// UI Components (Material-UI)
import { Box, Card, CardContent, Typography, ... } from '@mui/material';

// Icons
import { Mic, MicOff, VolumeUp, Settings, ... } from '@mui/icons-material';

// Theme
import { nexusColors } from '../../theme/nexusTheme';

// Services
import { premiumFreeVoiceAPI } from '../../services/premiumFreeVoiceAPI';
```

### State Management

```typescript
// Основний стан
const [isListening, setIsListening] = useState<boolean>(false);
const [isConnected, setIsConnected] = useState<boolean>(false);
const [currentCommand, setCurrentCommand] = useState<string>("");
const [confidence, setConfidence] = useState<number>(0);

// UI стан
const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

// Дані
const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([]);
const [aiResponse, setAiResponse] = useState<string>("");
const [isProcessing, setIsProcessing] = useState<boolean>(false);

// API стан
const [voiceCapabilities, setVoiceCapabilities] =
  useState<VoiceCapabilities | null>(null);
const [currentProvider, setCurrentProvider] = useState<string>("auto");

// Налаштування
const [settings, setSettings] = useState<VoiceSettings>({
  language: "uk-UA",
  voice: "Lesya",
  speed: 1,
  pitch: 1,
  volume: 0.8,
  autoSpeak: true,
  continuousListening: false,
  wakeWord: "Нексус",
});
```

### Refs

```typescript
// Web Speech API references
const recognitionRef = useRef<SpeechRecognition | null>(null);
const synthRef = useRef<SpeechSynthesis | null>(null);
```

---

## 🔄 Життєвий Цикл

### 1. Ініціалізація (useEffect)

```typescript
useEffect(() => {
  // 1. Ініціалізація Premium FREE Voice API
  initVoiceAPI();

  // 2. Ініціалізація Web Speech API
  initWebSpeechAPI();

  // 3. Cleanup при розмонтуванні
  return () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
}, []);
```

#### initVoiceAPI()

```typescript
const initVoiceAPI = async () => {
  try {
    // Перевірка здоров'я API
    const isHealthy = await premiumFreeVoiceAPI.checkHealth();

    if (isHealthy) {
      // Отримання можливостей
      const capabilities = await premiumFreeVoiceAPI.getCapabilities();
      setVoiceCapabilities(capabilities);
      setCurrentProvider(capabilities.recommended_tts);

      console.log("✅ Premium FREE Voice API готовий");
    } else {
      console.warn("⚠️  API недоступний. Browser fallback.");
    }
  } catch (error) {
    console.error("❌ Помилка API:", error);
  }
};
```

#### initWebSpeechAPI()

```typescript
const initWebSpeechAPI = () => {
  // 1. Перевірка підтримки
  if (!("webkitSpeechRecognition" in window)) {
    console.error("❌ Web Speech API недоступний");
    return;
  }

  // 2. Створення екземпляру
  const SpeechRecognition = window.webkitSpeechRecognition;
  recognitionRef.current = new SpeechRecognition();

  // 3. Налаштування
  recognitionRef.current.continuous = true;
  recognitionRef.current.interimResults = true;
  recognitionRef.current.lang = "uk-UA";
  recognitionRef.current.maxAlternatives = 1;

  // 4. Обробники подій
  recognitionRef.current.onstart = handleRecognitionStart;
  recognitionRef.current.onresult = handleRecognitionResult;
  recognitionRef.current.onerror = handleRecognitionError;
  recognitionRef.current.onend = handleRecognitionEnd;

  // 5. Ініціалізація Speech Synthesis
  if ("speechSynthesis" in window) {
    synthRef.current = window.speechSynthesis;
    loadVoices();
  }
};
```

### 2. Оновлення Мови (useEffect)

```typescript
useEffect(() => {
  if (recognitionRef.current) {
    recognitionRef.current.lang = settings.language;
  }
}, [settings.language]);
```

---

## 🎤 Speech Recognition Flow

### Послідовність Подій

```
User clicks Mic Button
         ↓
  startListening()
         ↓
Request Microphone Permission
         ↓
  recognition.start()
         ↓
   onstart → setIsListening(true)
         ↓
Speech detected
         ↓
   onresult → processVoiceCommand()
         ↓
Generate AI Response
         ↓
  speakResponse()
         ↓
   onend → setIsListening(false)
```

### startListening()

```typescript
const startListening = async () => {
  // 1. Валідація
  if (!recognitionRef.current) {
    alert("Голосове розпізнавання недоступне");
    return;
  }

  if (isListening) {
    console.warn("Вже слухаємо");
    return;
  }

  // 2. Запит дозволу на мікрофон
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    alert("Доступ до мікрофона заборонено");
    return;
  }

  // 3. Запуск розпізнавання
  try {
    recognitionRef.current.start();
    console.log("🎤 Розпізнавання запущено");
  } catch (error) {
    console.error("Помилка запуску:", error);
  }
};
```

### stopListening()

```typescript
const stopListening = () => {
  if (recognitionRef.current && isListening) {
    recognitionRef.current.stop();
    setIsListening(false);
    console.log("🛑 Розпізнавання зупинено");
  }
};
```

### handleRecognitionResult()

```typescript
const handleRecognitionResult = (event: SpeechRecognitionEvent) => {
  let finalTranscript = "";
  let interimTranscript = "";

  // Обробка результатів
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    const confidence = event.results[i][0].confidence;

    if (event.results[i].isFinal) {
      finalTranscript += transcript;
      processVoiceCommand(transcript, confidence);
    } else {
      interimTranscript += transcript;
    }
  }

  // Оновлення UI
  setCurrentCommand(interimTranscript || finalTranscript);
  setConfidence(event.results[0]?.[0]?.confidence * 100 || 0);
};
```

---

## 🤖 AI Command Processing

### processVoiceCommand()

```typescript
const processVoiceCommand = async (transcript: string, confidence: number) => {
  // 1. Створення об'єкта команди
  const command: VoiceCommand = {
    id: Date.now().toString(),
    phrase: transcript,
    action: "processing",
    module: "voice",
    confidence: confidence * 100,
    timestamp: new Date(),
    executed: false,
  };

  // 2. Додавання до історії
  setRecentCommands((prev) => [command, ...prev.slice(0, 9)]);
  setIsProcessing(true);

  // 3. Симуляція обробки
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 4. Генерація відповіді
  const response = generateAIResponse(transcript);
  setAiResponse(response);

  // 5. Озвучування відповіді
  if (settings.autoSpeak && voiceEnabled) {
    speakResponseBrowser(response);
  }

  // 6. Оновлення статусу
  command.executed = true;
  setRecentCommands((prev) =>
    prev.map((cmd) =>
      cmd.id === command.id
        ? { ...cmd, action: "completed", executed: true }
        : cmd,
    ),
  );

  setIsProcessing(false);
  setCurrentCommand("");
};
```

### generateAIResponse()

```typescript
const generateAIResponse = (command: string): string => {
  const lowerCommand = command.toLowerCase();

  // Маппінг команд на відповіді
  const commandMap: Record<string, string> = {
    дашборд: "Відкриваю головний дашборд...",
    агент: "Переходжу до модуля AI агентів...",
    безпека: "Відкриваю центр кібербезпеки...",
    // ... інші команди
  };

  // Пошук відповідності
  for (const [keyword, response] of Object.entries(commandMap)) {
    if (lowerCommand.includes(keyword)) {
      return response;
    }
  }

  // Дефолтна відповідь
  return `Ви сказали: "${command}". Аналізую команду...`;
};
```

---

## 🔊 Text-to-Speech Flow

### Стратегія Озвучування

```
speakResponse()
      ↓
Try Premium FREE API
      ↓
  Success? ──YES──→ Play Audio
      ↓
     NO
      ↓
Fallback to Browser API
      ↓
  speakResponseBrowser()
      ↓
   Play Audio
```

### speakResponsePremiumFree()

```typescript
const speakResponsePremiumFree = async (text: string) => {
  if (!voiceEnabled) return;

  try {
    const lang = settings.language.startsWith("uk") ? "uk" : "en";

    await premiumFreeVoiceAPI.textToSpeech({
      text,
      language: lang,
      speed: settings.speed,
      provider: "auto",
    });

    console.log("✅ TTS успішно (Premium FREE)");
  } catch (error) {
    console.error("❌ Помилка Premium FREE TTS:", error);
    speakResponseBrowser(text); // Fallback
  }
};
```

### speakResponseBrowser()

```typescript
const speakResponseBrowser = (text: string) => {
  if (!synthRef.current || !voiceEnabled) return;

  // 1. Зупинка попереднього озвучування
  synthRef.current.cancel();

  // 2. Створення utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = settings.language;
  utterance.rate = settings.speed;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;

  // 3. Вибір голосу
  const voices = synthRef.current.getVoices();
  const selectedVoice = voices.find(
    (v) => v.lang === settings.language || v.name === settings.voice,
  );

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // 4. Обробники подій
  utterance.onstart = () => console.log("🔊 TTS START");
  utterance.onend = () => console.log("✅ TTS END");
  utterance.onerror = (e) => console.error("❌ TTS ERROR:", e);

  // 5. Озвучування
  synthRef.current.speak(utterance);
};
```

---

## 🎨 UI Rendering

### Основна Структура

```tsx
<Box
  sx={
    {
      /* стилі */
    }
  }
>
  {/* Заголовок */}
  <Typography variant="h4">🎤 AI Voice Interface</Typography>

  {/* Головна Кнопка Мікрофона */}
  <VoicePulseButton />

  {/* Статус і Метрики */}
  <StatusMetrics />

  {/* Поточна Команда і Відповідь */}
  <CommandResponse />

  {/* Історія Команд */}
  <RecentCommands />

  {/* Контрольні Кнопки */}
  <ControlButtons />

  {/* Діалог Налаштувань */}
  <SettingsDialog />
</Box>
```

### Voice Pulse Button

```tsx
<motion.div
  animate={{
    scale: isListening ? [1, 1.2, 1] : 1,
    boxShadow: isListening
      ? ["0 0 0 0 rgba(0, 255, 157, 0.7)", "0 0 0 20px rgba(0, 255, 157, 0)"]
      : "0 0 0 0 rgba(0, 255, 157, 0)",
  }}
  transition={{
    duration: 1.5,
    repeat: isListening ? Infinity : 0,
  }}
>
  <IconButton
    onClick={isListening ? stopListening : startListening}
    sx={{
      width: 120,
      height: 120,
      background: isListening
        ? `linear-gradient(45deg, ${nexusColors.accent.main}, ${nexusColors.success.main})`
        : `linear-gradient(45deg, ${nexusColors.primary.main}, ${nexusColors.accent.main})`,
    }}
  >
    {isListening ? <MicIcon /> : <MicOffIcon />}
  </IconButton>
</motion.div>
```

### Status Indicators

```tsx
<Box sx={{ display: "flex", gap: 2 }}>
  <Chip
    icon={isConnected ? <CheckCircle /> : <Cancel />}
    label={isConnected ? "Connected" : "Disconnected"}
    color={isConnected ? "success" : "error"}
  />

  <Chip icon={<AccessTime />} label={formatTime(listeningTime)} />

  <Chip icon={<TrendingUp />} label={`Confidence: ${confidence.toFixed(0)}%`} />
</Box>
```

### Recent Commands List

```tsx
<List>
  <AnimatePresence>
    {recentCommands.map((cmd) => (
      <motion.div
        key={cmd.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
      >
        <ListItem>
          <ListItemIcon>
            {cmd.executed ? <CheckCircle /> : <HourglassEmpty />}
          </ListItemIcon>
          <ListItemText
            primary={cmd.phrase}
            secondary={`${cmd.confidence.toFixed(0)}% • ${formatTime(cmd.timestamp)}`}
          />
        </ListItem>
      </motion.div>
    ))}
  </AnimatePresence>
</List>
```

---

## ⚙️ Налаштування

### Settings Dialog

```tsx
<Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
  <DialogTitle>⚙️ Voice Settings</DialogTitle>

  <DialogContent>
    {/* Мова */}
    <FormControl fullWidth>
      <InputLabel>Language</InputLabel>
      <Select
        value={settings.language}
        onChange={(e) =>
          setSettings((prev) => ({
            ...prev,
            language: e.target.value,
          }))
        }
      >
        <MenuItem value="uk-UA">🇺🇦 Українська</MenuItem>
        <MenuItem value="en-US">🇬🇧 English</MenuItem>
      </Select>
    </FormControl>

    {/* Швидкість */}
    <Box>
      <Typography>Speed: {settings.speed}</Typography>
      <Slider
        value={settings.speed}
        min={0.5}
        max={2}
        step={0.1}
        onChange={(e, value) =>
          setSettings((prev) => ({
            ...prev,
            speed: value as number,
          }))
        }
      />
    </Box>

    {/* Висота */}
    <Box>
      <Typography>Pitch: {settings.pitch}</Typography>
      <Slider
        value={settings.pitch}
        min={0.5}
        max={2}
        step={0.1}
        onChange={(e, value) =>
          setSettings((prev) => ({
            ...prev,
            pitch: value as number,
          }))
        }
      />
    </Box>

    {/* Гучність */}
    <Box>
      <Typography>Volume: {settings.volume}</Typography>
      <Slider
        value={settings.volume}
        min={0}
        max={1}
        step={0.1}
        onChange={(e, value) =>
          setSettings((prev) => ({
            ...prev,
            volume: value as number,
          }))
        }
      />
    </Box>

    {/* Автоозвучування */}
    <FormControlLabel
      control={
        <Switch
          checked={settings.autoSpeak}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              autoSpeak: e.target.checked,
            }))
          }
        />
      }
      label="Auto-speak responses"
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setSettingsOpen(false)}>Close</Button>
    <Button variant="contained">Save</Button>
  </DialogActions>
</Dialog>
```

---

## 🔌 API Integration

### Premium FREE Voice API Service

```typescript
// /services/premiumFreeVoiceAPI.ts

class PremiumFreeVoiceAPI {
  private baseUrl: string = "http://localhost:5094";

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getCapabilities(): Promise<VoiceCapabilities> {
    const response = await fetch(`${this.baseUrl}/api/capabilities`);
    return await response.json();
  }

  async textToSpeech(request: TTSRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
  }

  async speechToText(audio: Blob, language: string): Promise<STTResponse> {
    const formData = new FormData();
    formData.append("audio", audio);
    formData.append("language", language);

    const response = await fetch(`${this.baseUrl}/api/stt`, {
      method: "POST",
      body: formData,
    });

    return await response.json();
  }
}

export const premiumFreeVoiceAPI = new PremiumFreeVoiceAPI();
```

---

## 🧪 Testing

### Unit Tests

```typescript
describe("AIVoiceInterface", () => {
  it("should initialize Web Speech API", () => {
    // Test initialization
  });

  it("should start/stop listening", () => {
    // Test voice recognition
  });

  it("should process voice commands", () => {
    // Test command processing
  });

  it("should speak responses", () => {
    // Test TTS
  });
});
```

### Integration Tests

```typescript
describe("Voice API Integration", () => {
  it("should connect to Premium FREE API", async () => {
    const isHealthy = await premiumFreeVoiceAPI.checkHealth();
    expect(isHealthy).toBe(true);
  });

  it("should get capabilities", async () => {
    const capabilities = await premiumFreeVoiceAPI.getCapabilities();
    expect(capabilities.tts_providers).toBeDefined();
  });
});
```

---

## 📈 Performance

### Оптимізації

1. **Lazy Loading голосів**

   ```typescript
   useEffect(() => {
     const loadVoices = () => {
       const voices = synthRef.current.getVoices();
       // Cache voices
     };
     synthRef.current.addEventListener("voiceschanged", loadVoices);
   }, []);
   ```

2. **Debouncing обробки команд**

   ```typescript
   const debouncedProcess = useCallback(
     debounce((transcript) => processVoiceCommand(transcript), 500),
     [],
   );
   ```

3. **Мемоізація компонентів**
   ```typescript
   const RecentCommands = memo(({ commands }) => {
     // ...
   });
   ```

### Metrics

| Метрика                    | Значення |
| -------------------------- | -------- |
| Initial Load               | < 2s     |
| Recognition Start          | < 500ms  |
| TTS Latency (Browser)      | < 100ms  |
| TTS Latency (Premium FREE) | < 3s     |
| Memory Usage               | < 50MB   |

---

## 🔐 Security

### Дозволи

```typescript
// Запит дозволу на мікрофон
const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error("Permission denied:", error);
    return false;
  }
};
```

### Валідація

```typescript
const validateCommand = (command: string): boolean => {
  // Перевірка на XSS
  const sanitized = DOMPurify.sanitize(command);

  // Перевірка довжини
  if (command.length > 500) return false;

  // Перевірка на шкідливі команди
  const blacklist = ["<script>", "javascript:", "onerror="];
  return !blacklist.some((item) => command.toLowerCase().includes(item));
};
```

---

## 🐛 Error Handling

### Recognition Errors

```typescript
const handleRecognitionError = (event: SpeechRecognitionError) => {
  const errorMessages = {
    "no-speech": "Не вдалося почути мовлення",
    "audio-capture": "Мікрофон недоступний",
    "not-allowed": "Доступ до мікрофона заборонено",
    network: "Проблема з мережею",
  };

  const message = errorMessages[event.error] || event.error;
  alert(message);

  setIsListening(false);
  setIsConnected(false);
};
```

### API Errors

```typescript
try {
  await speakResponsePremiumFree(text);
} catch (error) {
  console.error("Premium FREE TTS failed:", error);

  // Fallback to browser API
  try {
    speakResponseBrowser(text);
  } catch (fallbackError) {
    console.error("Browser TTS also failed:", fallbackError);
    alert("Озвучування недоступне");
  }
}
```

---

## 📝 Changelog

### v1.0.0 (2025-10-12)

- ✅ Initial release
- ✅ Web Speech API integration
- ✅ Premium FREE Voice API support
- ✅ Multi-language support (uk, en)
- ✅ Beautiful UI with animations
- ✅ Settings panel
- ✅ Command history

### v1.1.0 (Planned)

- [ ] Improved noise reduction
- [ ] Additional languages
- [ ] Voice profiles
- [ ] Custom wake words

---

## 🎯 Best Practices

1. **Завжди перевіряйте підтримку браузера**

   ```typescript
   if (!("webkitSpeechRecognition" in window)) {
     // Show error
   }
   ```

2. **Використовуйте fallback стратегії**

   ```typescript
   try {
     await premiumAPI();
   } catch {
     browserAPI();
   }
   ```

3. **Обробляйте всі помилки**

   ```typescript
   recognition.onerror = handleError;
   utterance.onerror = handleError;
   ```

4. **Зупиняйте попередні операції**

   ```typescript
   synthRef.current.cancel();
   recognitionRef.current.stop();
   ```

5. **Очищайте ресурси**
   ```typescript
   useEffect(() => {
     return () => {
       // Cleanup
     };
   }, []);
   ```

---

**Готово до розробки! 🚀**
