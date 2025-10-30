# 🎨 Predator12 Multi-Theme System

**7 унікальних тем для Nexus Core V3**

---

## 🚀 Quick Start

### 1. Install
```bash
npm install @mui/material @emotion/react @emotion/styled
```

### 2. Wrap your app
```tsx
import { NexusThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/theme/ThemeSwitcher';

function App() {
  return (
    <NexusThemeProvider defaultThemeId="dark-cyber">
      <YourApp />
      <ThemeSwitcher />
    </NexusThemeProvider>
  );
}
```

### 3. Use in components
```tsx
import { useNexusTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { colors, currentTheme } = useNexusTheme();

  return (
    <Box sx={{ background: colors.background.paper }}>
      <Typography sx={{ color: colors.text.primary }}>
        Theme: {currentTheme.name}
      </Typography>
    </Box>
  );
};
```

---

## 🎨 Available Themes

| Theme | ID | Colors | Style |
|-------|-----|--------|-------|
| 🌌 Dark Cyber | `dark-cyber` | Cyan + Purple | Default, Futuristic |
| 🟢 Matrix | `matrix` | Neon Green | Classic Terminal |
| 🌅 Sunset | `sunset` | Orange + Purple | Warm Gradient |
| 🌊 Ocean | `ocean` | Deep Blue | Calm Ocean |
| 🗼 Neon Tokyo | `neon-tokyo` | Pink + Cyan | Bright Neon |
| 💾 Retro Terminal | `retro-terminal` | Amber | Monochrome |
| ☀️ Light | `light` | Sky Blue + Purple | Clean Light |

---

## 📦 What's Included

```
frontend/src/
├── theme/themes.ts                    # 7 themes + utilities
├── contexts/ThemeContext.tsx          # React Context
├── components/theme/ThemeSwitcher.tsx # Floating UI
└── AppThemeDemo.tsx                   # Demo example
```

---

## 💡 Example Usage

### Change theme programmatically
```tsx
const { setTheme } = useNexusTheme();
setTheme('matrix'); // Switch to Matrix theme
```

### Use theme colors
```tsx
const { colors } = useNexusTheme();

<Button sx={{
  background: colors.gradients.primary,
  '&:hover': {
    boxShadow: `0 0 20px ${colors.primary.glow}`
  }
}}>
  Click Me
</Button>
```

### Toggle dark/light
```tsx
const { toggleTheme } = useNexusTheme();

<IconButton onClick={toggleTheme}>
  <Brightness4Icon />
</IconButton>
```

---

## 📚 Documentation

- **[Full Guide](MULTI_THEME_GUIDE.md)** - Complete documentation
- **[Quick Reference](THEME_SYSTEM_QUICK_REF.md)** - Cheat sheet
- **[Integration Examples](THEME_INTEGRATION_EXAMPLES.md)** - How to integrate
- **[Completion Report](MULTI_THEME_COMPLETION_REPORT.md)** - Technical details

---

## ✨ Features

✅ 7 unique themes  
✅ Dynamic switching (no reload)  
✅ LocalStorage persistence  
✅ TypeScript support  
✅ Material-UI integration  
✅ Floating theme switcher  
✅ Smooth animations  
✅ Responsive design  

---

## 🎯 Color Structure

Each theme includes:
```tsx
{
  background: { default, paper, elevated },
  primary: { main, light, dark, glow },
  secondary: { main, light, dark, glow },
  accent: { 6+ colors },
  status: { success, warning, error, info },
  text: { primary, secondary, disabled, glow },
  border: { light, medium, heavy },
  gradients: { primary, secondary, success, danger }
}
```

---

## 🔧 API

### useNexusTheme()
```tsx
const {
  currentTheme,    // Current theme config
  currentThemeId,  // Theme ID string
  setTheme,        // Change theme function
  toggleTheme,     // Toggle dark/light
  colors           // Quick access to colors
} = useNexusTheme();
```

---

## 🎮 Demo

Run demo application:
```bash
npm start
```

Open: `http://localhost:3000`

Click floating palette button (bottom-right) to switch themes!

---

## 📊 Stats

- **7** complete themes
- **40+** colors per theme
- **2500+** lines of code
- **1250+** lines of docs
- **100%** TypeScript
- **✅** Production-ready

---

## 🤝 Integration Checklist

- [ ] Install dependencies
- [ ] Wrap app with `NexusThemeProvider`
- [ ] Add `ThemeSwitcher` component
- [ ] Replace hardcoded colors with `colors.*`
- [ ] Test on all themes
- [ ] Check responsive design
- [ ] Verify LocalStorage works

---

## 🌟 Examples

### Gradient Text
```tsx
<Typography sx={{
  background: colors.gradients.primary,
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}}>
  Gradient Text
</Typography>
```

### Glowing Card
```tsx
<Card sx={{
  background: colors.background.paper,
  border: `1px solid ${colors.border.light}`,
  '&:hover': {
    borderColor: colors.primary.main,
    boxShadow: `0 8px 32px ${colors.primary.glow}`,
  }
}} />
```

---

## 🐛 Troubleshooting

**Theme not persisting?**
- Check localStorage is enabled
- Verify `predator12-theme` key exists

**Colors not updating?**
- Ensure component uses `useNexusTheme()` hook
- Check component is inside `NexusThemeProvider`

**MUI components not themed?**
- MUI automatically picks up theme
- Use standard MUI color props: `color="primary"`

---

## 📝 License

Part of Predator12 Nexus Core V3

---

## 🎉 Ready to Use!

```tsx
<NexusThemeProvider>
  <App />
  <ThemeSwitcher />
</NexusThemeProvider>
```

**That's it!** Your app now has 7 beautiful themes 🎨

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Created:** 2024

🎨 **Predator12 Nexus Core V3 - Multi-Theme System**
