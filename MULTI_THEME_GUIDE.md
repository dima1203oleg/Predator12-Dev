# 🎨 MULTI-THEME SYSTEM GUIDE

**Predator12 Nexus Core V3 - Система множинних тем**

## 📋 Зміст

1. [Огляд системи](#огляд-системи)
2. [Доступні теми](#доступні-теми)
3. [Швидкий старт](#швидкий-старт)
4. [API та інтеграція](#api-та-інтеграція)
5. [Створення власної теми](#створення-власної-теми)
6. [Компоненти](#компоненти)
7. [Хуки та утиліти](#хуки-та-утиліти)

---

## 🎯 Огляд системи

Система множинних тем дозволяє користувачам динамічно змінювати зовнішній вигляд інтерфейсу без перезавантаження. Всі теми оптимізовані для кіберпанк-естетики та професійного використання.

### Особливості:
- ✅ **7 унікальних тем** - від Dark Cyber до Retro Terminal
- ✅ **Динамічне переключення** - без перезавантаження сторінки
- ✅ **LocalStorage** - збереження обраної теми
- ✅ **TypeScript** - повна типізація
- ✅ **Material-UI інтеграція** - нативна підтримка MUI
- ✅ **React Context** - глобальне управління станом
- ✅ **Responsive дизайн** - адаптивність під всі пристрої

---

## 🎨 Доступні теми

### 1. 🌌 Dark Cyber (Default)
**ID:** `dark-cyber`
- **Тип:** Dark
- **Палітра:** Cyan (#00f2ff) + Purple (#8a2be2)
- **Стиль:** Futuristic cyberpunk
- **Використання:** Основна темна тема для щоденної роботи

### 2. 🟢 Matrix
**ID:** `matrix`
- **Тип:** Dark
- **Палітра:** Neon Green (#00ff41)
- **Стиль:** Classic terminal matrix
- **Використання:** Для фанатів Matrix та консольного інтерфейсу

### 3. 🌅 Sunset
**ID:** `sunset`
- **Тип:** Dark
- **Палітра:** Orange (#ff6b35) + Purple (#c44cff)
- **Стиль:** Warm sunset gradient
- **Використання:** Тепла альтернатива для вечірньої роботи

### 4. 🌊 Ocean
**ID:** `ocean`
- **Тип:** Dark
- **Палітра:** Deep Blue (#00d4ff) + Azure
- **Стиль:** Deep ocean depths
- **Використання:** Спокійна тема з морською гамою

### 5. 🗼 Neon Tokyo
**ID:** `neon-tokyo`
- **Тип:** Dark
- **Палітра:** Pink (#ff0099) + Cyan (#00ffff)
- **Стиль:** Japanese neon streets
- **Використання:** Яскрава неонова тема для креативної роботи

### 6. 💾 Retro Terminal
**ID:** `retro-terminal`
- **Тип:** Dark
- **Палітра:** Amber (#ffb000)
- **Стиль:** Classic monochrome terminal
- **Використання:** Ностальгійна тема старих терміналів

### 7. ☀️ Light
**ID:** `light`
- **Тип:** Light
- **Палітра:** Sky Blue (#0ea5e9) + Purple (#8b5cf6)
- **Стиль:** Clean modern light
- **Використання:** Світла тема для денної роботи

---

## 🚀 Швидкий старт

### 1. Встановлення залежностей

```bash
npm install @mui/material @emotion/react @emotion/styled
```

### 2. Обгортання додатку в ThemeProvider

```tsx
import React from 'react';
import { NexusThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/theme/ThemeSwitcher';
import App from './App';

const Root = () => {
  return (
    <NexusThemeProvider defaultThemeId="dark-cyber">
      <App />
      <ThemeSwitcher />
    </NexusThemeProvider>
  );
};

export default Root;
```

### 3. Використання теми в компонентах

```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNexusTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { colors, currentTheme } = useNexusTheme();
  
  return (
    <Box
      sx={{
        background: colors.background.paper,
        borderRadius: 2,
        p: 3,
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          background: colors.gradients.primary,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {currentTheme.name} Theme
      </Typography>
    </Box>
  );
};
```

---

## 🔧 API та інтеграція

### ThemeContext API

```tsx
interface ThemeContextValue {
  currentTheme: ThemeConfig;      // Поточна конфігурація теми
  currentThemeId: string;          // ID поточної теми
  setTheme: (themeId: string) => void;  // Встановити тему
  toggleTheme: () => void;         // Перемкнути dark/light
  colors: ThemeColorPalette;       // Швидкий доступ до кольорів
}
```

### useNexusTheme Hook

```tsx
import { useNexusTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { 
    currentTheme,    // Поточна тема
    currentThemeId,  // ID теми
    setTheme,        // Функція зміни теми
    toggleTheme,     // Функція toggle
    colors           // Колірна палітра
  } = useNexusTheme();
  
  return (
    <button onClick={() => setTheme('matrix')}>
      Switch to Matrix
    </button>
  );
};
```

### Theme Colors Structure

```tsx
interface ThemeColorPalette {
  background: {
    default: string;   // Основний фон
    paper: string;     // Фон карток
    elevated: string;  // Піднесені елементи
  };
  primary: {
    main: string;      // Основний колір
    light: string;     // Світліший варіант
    dark: string;      // Темніший варіант
    glow: string;      // Ефект свічення (rgba)
  };
  secondary: { ... };  // Вторинний колір
  accent: {
    [key: string]: string;  // Акцентні кольори
  };
  status: {
    success: string;   // Успіх
    warning: string;   // Попередження
    error: string;     // Помилка
    info: string;      // Інформація
  };
  text: {
    primary: string;   // Основний текст
    secondary: string; // Другорядний текст
    disabled: string;  // Вимкнений текст
    glow: string;      // Світіння тексту
  };
  border: {
    light: string;     // Легкий border
    medium: string;    // Середній border
    heavy: string;     // Яскравий border
  };
  gradients: {
    primary: string;   // Основний градієнт
    secondary: string; // Другорядний градієнт
    success: string;   // Градієнт успіху
    danger: string;    // Градієнт помилки
  };
}
```

---

## 🎨 Створення власної теми

### Крок 1: Визначте конфігурацію

```tsx
import { ThemeConfig } from '../theme/themes';

export const myCustomTheme: ThemeConfig = {
  id: 'my-custom-theme',
  name: 'My Custom',
  description: 'Моя унікальна тема',
  icon: '🌟',
  type: 'dark',
  colors: {
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
      elevated: '#3a3a3a',
    },
    primary: {
      main: '#ff6b9d',
      light: '#ff8eb3',
      dark: '#e54f7f',
      glow: 'rgba(255, 107, 157, 0.4)'
    },
    // ... решта кольорів
  }
};
```

### Крок 2: Додайте тему до колекції

```tsx
// В themes.ts
import { myCustomTheme } from './customThemes';

export const allThemes: ThemeConfig[] = [
  darkCyberTheme,
  matrixTheme,
  // ... інші теми
  myCustomTheme,  // Додайте свою тему
];
```

### Крок 3: Використовуйте нову тему

```tsx
const { setTheme } = useNexusTheme();
setTheme('my-custom-theme');
```

---

## 🧩 Компоненти

### ThemeSwitcher

Floating кнопка для відкриття діалогу вибору теми.

```tsx
<ThemeSwitcher
  currentThemeId={currentThemeId}
  onThemeChange={(themeId) => setTheme(themeId)}
/>
```

**Особливості:**
- Floating button з gradient background
- Responsive dialog з превью тем
- Smooth анімації та transitions
- Color palette preview для кожної теми
- Current theme indicator

### NexusThemeProvider

React Context Provider для управління темами.

```tsx
<NexusThemeProvider defaultThemeId="dark-cyber">
  {children}
</NexusThemeProvider>
```

**Props:**
- `defaultThemeId?: string` - ID теми за замовчуванням
- `children: ReactNode` - Дочірні компоненти

---

## 🔨 Хуки та утиліти

### useNexusTheme()

Основний хук для роботи з темами.

```tsx
const { currentTheme, setTheme, colors } = useNexusTheme();
```

### getCurrentThemeId()

Отримати ID поточної теми з localStorage.

```tsx
const themeId = getCurrentThemeId(); // 'dark-cyber' | null
```

### onThemeChange()

Підписка на зміну теми.

```tsx
useEffect(() => {
  const unsubscribe = onThemeChange((theme) => {
    console.log('Theme changed to:', theme.name);
  });
  
  return unsubscribe;
}, []);
```

### getThemeById()

Отримати конфігурацію теми за ID.

```tsx
import { getThemeById } from '../theme/themes';

const theme = getThemeById('matrix');
```

### createNexusTheme()

Створити Material-UI theme з конфігурації.

```tsx
import { createNexusTheme } from '../theme/themes';

const muiTheme = createNexusTheme(myThemeConfig);
```

---

## 💡 Приклади використання

### Приклад 1: Компонент з темою

```tsx
import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { useNexusTheme } from '../contexts/ThemeContext';

const ThemedCard = () => {
  const { colors, currentTheme } = useNexusTheme();
  
  return (
    <Card
      sx={{
        background: colors.background.paper,
        border: `1px solid ${colors.border.light}`,
        '&:hover': {
          borderColor: colors.primary.main,
          boxShadow: `0 8px 32px ${colors.primary.glow}`,
        },
      }}
    >
      <CardContent>
        <Typography variant="h5" sx={{ color: colors.text.primary }}>
          {currentTheme.icon} {currentTheme.name}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          {currentTheme.description}
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            background: colors.gradients.primary,
          }}
        >
          Action Button
        </Button>
      </CardContent>
    </Card>
  );
};
```

### Приклад 2: Theme Toggle Button

```tsx
import React from 'react';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useNexusTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useNexusTheme();
  
  return (
    <IconButton onClick={toggleTheme}>
      {currentTheme.type === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
};
```

### Приклад 3: Theme Selector Dropdown

```tsx
import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { useNexusTheme } from '../contexts/ThemeContext';
import { allThemes } from '../theme/themes';

const ThemeSelector = () => {
  const { currentThemeId, setTheme } = useNexusTheme();
  
  return (
    <Select
      value={currentThemeId}
      onChange={(e) => setTheme(e.target.value)}
    >
      {allThemes.map((theme) => (
        <MenuItem key={theme.id} value={theme.id}>
          {theme.icon} {theme.name}
        </MenuItem>
      ))}
    </Select>
  );
};
```

---

## 📊 Структура файлів

```
frontend/src/
├── theme/
│   └── themes.ts                 # Всі теми та утиліти
├── contexts/
│   └── ThemeContext.tsx          # React Context для тем
├── components/
│   └── theme/
│       └── ThemeSwitcher.tsx     # Компонент вибору теми
└── AppThemeDemo.tsx              # Приклад інтеграції
```

---

## 🎯 Best Practices

### 1. Використовуйте colors з контексту

```tsx
// ✅ Добре
const { colors } = useNexusTheme();
<Box sx={{ background: colors.background.paper }} />

// ❌ Погано
<Box sx={{ background: '#111827' }} />
```

### 2. Застосовуйте градієнти для акцентів

```tsx
const { colors } = useNexusTheme();

<Typography
  sx={{
    background: colors.gradients.primary,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }}
>
  Gradient Text
</Typography>
```

### 3. Додавайте hover ефекти з glow

```tsx
<Button
  sx={{
    '&:hover': {
      boxShadow: `0 0 20px ${colors.primary.glow}`,
    },
  }}
>
  Hover Me
</Button>
```

### 4. Використовуйте transitions для плавності

```tsx
<Box
  sx={{
    background: colors.background.paper,
    transition: 'all 0.3s ease',
  }}
/>
```

---

## 🐛 Troubleshooting

### Тема не зберігається після перезавантаження

**Проблема:** LocalStorage не працює

**Рішення:**
```tsx
// Перевірте, чи працює localStorage
if (typeof window !== 'undefined') {
  console.log(localStorage.getItem('predator12-theme'));
}
```

### Кольори не оновлюються

**Проблема:** Компонент не підписаний на зміни

**Рішення:**
```tsx
// Використовуйте хук у компоненті
const { colors } = useNexusTheme();
```

### Material-UI компоненти не змінюють колір

**Проблема:** MUI використовує власну тему

**Рішення:**
```tsx
// MUI автоматично отримує тему через ThemeProvider
// Використовуйте стандартні кольори MUI
<Button color="primary" />
```

---

## 📚 Додаткові ресурси

- [Material-UI Theming](https://mui.com/material-ui/customization/theming/)
- [React Context API](https://react.dev/reference/react/useContext)
- [TypeScript Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [CSS Color Theory](https://www.w3schools.com/colors/colors_theory.asp)

---

## ✅ Checklist перед продакшеном

- [ ] Всі теми протестовані на різних екранах
- [ ] LocalStorage працює коректно
- [ ] Transitions плавні та не лагають
- [ ] Accessibility (контрастність) відповідає WCAG
- [ ] TypeScript типи повністю покривають API
- [ ] Документація актуальна
- [ ] Приклади коду працюють
- [ ] Немає console.error в браузері

---

**Created:** 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready

Predator12 Nexus Core V3 - Multi-Theme System 🎨
