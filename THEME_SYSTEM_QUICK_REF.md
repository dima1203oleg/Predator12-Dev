# 🎨 THEME SYSTEM QUICK REFERENCE

## 📦 Файли

```
frontend/src/
├── theme/themes.ts                    # Всі 7 тем + утиліти
├── contexts/ThemeContext.tsx          # React Context
├── components/theme/ThemeSwitcher.tsx # UI для вибору теми
└── AppThemeDemo.tsx                   # Demo приклад
```

## 🎯 7 Доступних тем

| ID | Назва | Тип | Основні кольори | Emoji |
|----|-------|-----|-----------------|-------|
| `dark-cyber` | Dark Cyber | Dark | Cyan + Purple | 🌌 |
| `matrix` | Matrix | Dark | Neon Green | 🟢 |
| `sunset` | Sunset | Dark | Orange + Purple | 🌅 |
| `ocean` | Ocean | Dark | Deep Blue | 🌊 |
| `neon-tokyo` | Neon Tokyo | Dark | Pink + Cyan | 🗼 |
| `retro-terminal` | Retro Terminal | Dark | Amber | 💾 |
| `light` | Light | Light | Sky Blue + Purple | ☀️ |

## ⚡ Швидкий старт

### 1. Обгорнути додаток

```tsx
import { NexusThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/theme/ThemeSwitcher';

<NexusThemeProvider defaultThemeId="dark-cyber">
  <App />
  <ThemeSwitcher />
</NexusThemeProvider>
```

### 2. Використати в компоненті

```tsx
import { useNexusTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { colors, currentTheme, setTheme } = useNexusTheme();

  return (
    <Box sx={{ background: colors.background.paper }}>
      <Typography sx={{ color: colors.text.primary }}>
        Current: {currentTheme.name}
      </Typography>
      <Button onClick={() => setTheme('matrix')}>
        Switch to Matrix
      </Button>
    </Box>
  );
};
```

## 🎨 Колірна структура

```tsx
colors = {
  background: { default, paper, elevated },
  primary: { main, light, dark, glow },
  secondary: { main, light, dark, glow },
  accent: { cyan, purple, pink, green, ... },
  status: { success, warning, error, info },
  text: { primary, secondary, disabled, glow },
  border: { light, medium, heavy },
  gradients: { primary, secondary, success, danger }
}
```

## 🔧 API

### useNexusTheme() Hook

```tsx
const {
  currentTheme,    // ThemeConfig - вся конфігурація
  currentThemeId,  // string - ID поточної теми
  setTheme,        // (id: string) => void
  toggleTheme,     // () => void - dark ↔ light
  colors           // ThemeColorPalette - кольори
} = useNexusTheme();
```

### Утиліти

```tsx
import {
  getThemeById,      // (id: string) => ThemeConfig
  getDefaultTheme,   // () => ThemeConfig
  getCurrentThemeId, // () => string | null
  onThemeChange,     // (callback) => unsubscribe
  allThemes          // ThemeConfig[]
} from '../theme/themes';
```

## 💡 Приклади

### Градієнтний текст

```tsx
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

### Glow ефект

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

### Тематична картка

```tsx
<Card
  sx={{
    background: colors.background.paper,
    border: `1px solid ${colors.border.light}`,
    '&:hover': {
      borderColor: colors.primary.main,
      boxShadow: `0 8px 32px ${colors.primary.glow}`,
    },
  }}
/>
```

## 🎮 ThemeSwitcher Component

```tsx
<ThemeSwitcher
  currentThemeId={currentThemeId}
  onThemeChange={(themeId) => setTheme(themeId)}
/>
```

**Функції:**
- Floating кнопка (bottom-right)
- Діалог з preview всіх тем
- Color palette preview
- Smooth анімації
- Auto-save в localStorage

## 📊 Theme Config Structure

```tsx
interface ThemeConfig {
  id: string;                    // Унікальний ID
  name: string;                  // Назва для UI
  description: string;           // Опис теми
  icon: string;                  // Emoji іконка
  type: 'dark' | 'light';       // Тип теми
  colors: ThemeColorPalette;    // Колірна палітра
}
```

## 🔥 Best Practices

1. **Завжди використовуйте colors з контексту**
   ```tsx
   const { colors } = useNexusTheme();
   ```

2. **Застосовуйте transitions для плавності**
   ```tsx
   sx={{ transition: 'all 0.3s ease' }}
   ```

3. **Використовуйте gradients для акцентів**
   ```tsx
   background: colors.gradients.primary
   ```

4. **Додавайте glow effects для hover**
   ```tsx
   boxShadow: `0 0 20px ${colors.primary.glow}`
   ```

## 🎯 Створення власної теми

```tsx
export const myTheme: ThemeConfig = {
  id: 'my-theme',
  name: 'My Theme',
  description: 'Моя кастомна тема',
  icon: '🌟',
  type: 'dark',
  colors: {
    // ... колірна палітра
  }
};

// Додати до allThemes в themes.ts
export const allThemes = [
  darkCyberTheme,
  myTheme,  // <-- Додати тут
];
```

## 📱 Responsive Theme Button

```tsx
<IconButton
  onClick={() => setTheme('matrix')}
  sx={{
    position: 'fixed',
    bottom: 24,
    right: 24,
    background: colors.gradients.primary,
  }}
>
  <PaletteIcon />
</IconButton>
```

## 🌐 LocalStorage

Тема автоматично зберігається в localStorage:
- **Key:** `predator12-theme`
- **Value:** theme ID (наприклад, `dark-cyber`)
- **Auto-load:** При перезавантаженні автоматично завантажується

## ✅ Чеклист інтеграції

- [ ] NexusThemeProvider обгортає App
- [ ] ThemeSwitcher доданий до UI
- [ ] Компоненти використовують useNexusTheme()
- [ ] Тестовано на всіх темах
- [ ] LocalStorage працює
- [ ] Анімації плавні
- [ ] Немає hardcoded кольорів

---

**Version:** 1.0.0  
**Status:** ✅ Ready to use  
**Теми:** 7 uniques themes  
**File:** `THEME_SYSTEM_QUICK_REF.md`

🎨 Predator12 Nexus Core V3 - Multi-Theme System
