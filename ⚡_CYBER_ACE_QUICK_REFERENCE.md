# 🚀 CYBER-ACE Quick Reference

**Last Updated:** 14 жовтня 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## ⚡ Quick Start

```bash
# Start dev server
cd /Users/dima/Documents/Predator12/predator12-local/frontend
npm run dev

# Open CYBER-ACE
open http://localhost:5173/cyber-ace

# Build production
npm run build
```

---

## 📁 File Structure

```
predator12-local/frontend/src/modules/cyber-ace/
├── CyberAcePage.tsx              # Main page
├── CyberAceTestPage.tsx          # Test page
├── components/
│   ├── AceAvatar.tsx             # 3D avatar
│   ├── VoiceInput.tsx            # Voice interface
│   ├── QuickActions.tsx          # Action cards
│   ├── AgentCards.tsx            # Agent system
│   ├── StatusBar.tsx             # Status bar
│   └── index.ts                  # Barrel export
├── state/
│   └── cyberAceStore.ts          # Zustand store
├── locales/
│   ├── uk-UA.json                # Ukrainian
│   ├── en-US.json                # English
│   └── i18n.ts                   # i18n config
└── styles/
    └── cyber-ace.css             # All styles
```

---

## 🎯 Key Components

### 1. CyberAcePage

**Purpose:** Main entry point  
**Features:** Layout, background effects, component composition  
**Route:** `/cyber-ace`

### 2. AceAvatar

**Purpose:** 3D animated avatar  
**Tech:** Three.js + @react-three/fiber  
**Features:** Rotation, pulsation, particles, mood colors

### 3. VoiceInput

**Purpose:** Voice + text input  
**Tech:** Web Speech API  
**Languages:** Ukrainian (uk-UA), English (en-US)

### 4. QuickActions

**Purpose:** 6 quick action cards  
**Actions:** Transactions, Risks, Reports, Search, Alerts, Health

### 5. AgentCards

**Purpose:** Agent status display  
**Agents:** Sherlock, Guardian, Oracle, Sentinel, Scout, Librarian

### 6. StatusBar

**Purpose:** System status + controls  
**Features:** Time, notifications, settings, language switcher

---

## 🔧 State Management

### cyberAceStore (Zustand)

```typescript
// Import
import { useCyberAceStore } from './state/cyberAceStore';

// Usage
const { voiceInput, setVoiceInput } = useCyberAceStore();

// Available state
- voiceInput: { text, isListening }
- chatMessages: Message[]
- agents: Agent[]
- systemStatus: 'online' | 'offline' | 'processing'
- notifications: Notification[]
- currentMood: 'idle' | 'listening' | 'thinking' | 'error'

// Available actions (15+)
- setVoiceInput(text)
- toggleListening()
- addMessage(message)
- clearChat()
- updateAgentStatus(id, status)
- addNotification(notification)
- markNotificationRead(id)
- clearAllNotifications()
- setSystemStatus(status)
- setCurrentMood(mood)
```

---

## 🌍 Localization

### Switch Language

```typescript
import { useTranslation } from "react-i18next";

const { t, i18n } = useTranslation();

// Get translation
const title = t("title");

// Change language
i18n.changeLanguage("uk-UA"); // Ukrainian
i18n.changeLanguage("en-US"); // English

// Check current language
const isUkrainian = i18n.language === "uk-UA";
```

### Add New Translation

1. Edit `locales/uk-UA.json`
2. Edit `locales/en-US.json`
3. Use in component: `t('your.new.key')`

---

## 🎨 Styling

### CSS Classes

```css
/* Main page */
.cyber-ace-page
.ace-main-container

/* Avatar */
.ace-avatar-container
.ace-status-text

/* Voice Input */
.ace-voice-input
.voice-input-field
.voice-mic-button
.voice-send-button
.voice-wave-animation

/* Quick Actions */
.ace-quick-actions
.action-card

/* Agent Cards */
.ace-agent-cards
.agent-card
.agent-status-indicator
.agent-metrics

/* Status Bar */
.ace-status-bar
.status-bar-logo
.status-bar-system-status
.status-bar-time
.status-bar-actions
```

### Custom Colors

```css
/* Primary */
--ace-primary: #00ffff; /* Cyan */
--ace-secondary: #ff00ff; /* Magenta */

/* Status */
--ace-success: #00ff88; /* Green */
--ace-warning: #ffaa00; /* Orange */
--ace-error: #ff0055; /* Red */

/* Background */
--ace-bg-dark: #0a0e27; /* Dark blue */
--ace-bg-card: rgba(255, 255, 255, 0.05);
```

---

## 🎤 Voice API

### Start Recording

```typescript
const startRecording = () => {
  if (!recognition) return;

  recognition.start();
  useCyberAceStore.getState().toggleListening();
};
```

### Stop Recording

```typescript
const stopRecording = () => {
  if (!recognition) return;

  recognition.stop();
  useCyberAceStore.getState().toggleListening();
};
```

### Handle Recognition

```typescript
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  useCyberAceStore.getState().setVoiceInput(transcript);
};
```

---

## 🧪 Testing

### Manual Testing

```bash
# Start dev server
npm run dev

# Open test page
open http://localhost:5173/cyber-ace

# Test checklist
1. Check all components render
2. Test voice input (allow mic)
3. Switch language (UA/EN)
4. Click all quick actions
5. View agent cards
6. Check responsive design
```

### TypeScript Check

```bash
npm run type-check
```

### Build Test

```bash
npm run build
npm run preview
```

---

## 🐛 Troubleshooting

### White Screen

**Cause:** i18n Suspense issue  
**Fix:** Already fixed (Suspense disabled)

### Voice Not Working

**Cause:** Web Speech API not supported  
**Browser:** Use Chrome or Edge  
**Check:** Allow microphone permissions

### 3D Avatar Laggy

**Cause:** Weak GPU  
**Fix:** Reduce particles count in AceAvatar.tsx

### Language Not Switching

**Cause:** localStorage issue  
**Fix:** Clear browser cache and reload

---

## 📊 Performance Tips

### Optimize Bundle

```bash
# Analyze bundle
npm run build -- --analyze

# Check bundle size
ls -lh dist/assets/*.js
```

### Optimize 3D

```typescript
// Reduce particles
const PARTICLE_COUNT = 30; // Default: 50

// Disable shadows
<Canvas shadows={false}>
```

### Lazy Load Components

```typescript
const AceAvatar = lazy(() => import('./components/AceAvatar'));

<Suspense fallback={<LoadingScreen />}>
  <AceAvatar />
</Suspense>
```

---

## 🔗 Useful Links

### Documentation

- [Full Documentation](/Users/dima/Documents/Predator12/🎉_CYBER_ACE_FINAL_SUMMARY.md)
- [Testing Report](/Users/dima/Documents/Predator12/🧪_CYBER_ACE_TESTING_REPORT.md)
- [Implementation Plan](/Users/dima/Documents/Predator12/🎯_CYBER_ACE_IMPLEMENTATION_PLAN.md)

### External Resources

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand](https://docs.pmnd.rs/zustand)
- [i18next](https://www.i18next.com/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## 💡 Common Tasks

### Add New Quick Action

```typescript
// 1. Add to QuickActions.tsx
const newAction = {
  id: 'new-action',
  icon: '🆕',
  title: t('quickActions.newAction'),
  onClick: () => handleNewAction()
};

// 2. Add translation to locales/uk-UA.json
"quickActions": {
  "newAction": "Нова Дія"
}

// 3. Add translation to locales/en-US.json
"quickActions": {
  "newAction": "New Action"
}
```

### Add New Agent

```typescript
// 1. Update cyberAceStore.ts initial state
agents: [
  // ...existing agents
  {
    id: "new-agent",
    name: "NewAgent",
    role: "Role",
    status: "online",
    metrics: { accuracy: 95, tasksCompleted: 100, uptime: "99.9%" },
  },
];

// 2. Add translations
```

### Change Theme Colors

```css
/* Edit cyber-ace.css */
:root {
  --ace-primary: #00ffff; /* Your color */
  --ace-secondary: #ff00ff; /* Your color */
}
```

---

## 🚀 Deployment

### Production Build

```bash
# Build
npm run build

# Test production build
npm run preview

# Check output
ls -lh dist/
```

### Deploy to Staging

```bash
# Example: Deploy to Vercel
vercel deploy

# Example: Deploy to Netlify
netlify deploy --prod
```

### Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.predator12.com
VITE_APP_VERSION=1.0.0
```

---

## 📞 Need Help?

### Documentation

1. Check [Testing Report](/Users/dima/Documents/Predator12/🧪_CYBER_ACE_TESTING_REPORT.md)
2. Review [Implementation Plan](/Users/dima/Documents/Predator12/🎯_CYBER_ACE_IMPLEMENTATION_PLAN.md)
3. Read [Fix Summary](/Users/dima/Documents/Predator12/🔧_CYBER_ACE_FIX_SUMMARY.md)

### Known Issues

- See [Testing Report — Known Issues section]

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem("debug", "cyber-ace:*");

// Check store state
console.log(useCyberAceStore.getState());
```

---

**Quick Reference Created:** 14 жовтня 2025  
**Last Updated:** 14 жовтня 2025  
**Version:** 1.0.0

✨ Happy coding! 🤖
