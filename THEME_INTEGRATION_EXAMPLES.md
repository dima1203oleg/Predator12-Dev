# 🔧 THEME INTEGRATION EXAMPLES

Приклади інтеграції системи тем у існуючі компоненти Predator12.

## 📋 Зміст

1. [Оновлення App.tsx](#оновлення-apptsx)
2. [ModelProviderManager](#modelprovider manager)
3. [DashboardsPage](#dashboardspage)
4. [IngestPage](#ingestpage)
5. [Navigation/Header](#navigationheader)

---

## 🎯 1. Оновлення App.tsx

### Поточний код

```tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { nexusTheme } from './theme/nexusThemeV2';
import Dashboard from './Dashboard';

function App() {
  return (
    <ThemeProvider theme={nexusTheme}>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
```

### Оновлений код з multi-theme

```tsx
import React from 'react';
import { NexusThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/theme/ThemeSwitcher';
import Dashboard from './Dashboard';

function App() {
  return (
    <NexusThemeProvider defaultThemeId="dark-cyber">
      <Dashboard />
      <ThemeSwitcher />
    </NexusThemeProvider>
  );
}

export default App;
```

**Зміни:**
- ✅ Замінено `ThemeProvider` на `NexusThemeProvider`
- ✅ Видалено import `nexusTheme`
- ✅ Додано `ThemeSwitcher` компонент
- ✅ Встановлено `defaultThemeId`

---

## 🎨 2. ModelProviderManager

### Оновлення компонента для роботи з темами

```tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import { useNexusTheme } from '../../contexts/ThemeContext';
import { useProviders } from '../../hooks/useProviders';

const ModelProviderManager: React.FC = () => {
  const { colors, currentTheme } = useNexusTheme();
  const { providers, loading } = useProviders();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.background.default,
        p: 3,
        transition: 'background 0.5s ease',
      }}
    >
      {/* Header з тематичним градієнтом */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{
            background: colors.gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          🤖 Model & Provider Manager
        </Typography>
        <Typography variant="body1" sx={{ color: colors.text.secondary }}>
          Керування AI моделями та провайдерами • Theme: {currentTheme.icon} {currentTheme.name}
        </Typography>
      </Box>

      {/* Provider Cards */}
      <Grid container spacing={3}>
        {providers.map((provider) => (
          <Grid item xs={12} md={6} lg={4} key={provider.id}>
            <Card
              sx={{
                background: colors.background.paper,
                border: `1px solid ${colors.border.light}`,
                borderRadius: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.primary.main,
                  boxShadow: `0 8px 32px ${colors.primary.glow}`,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: colors.gradients.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${colors.primary.glow}`,
                    }}
                  >
                    {provider.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: colors.text.primary }}>
                      {provider.name}
                    </Typography>
                    <Chip
                      label={provider.status}
                      size="small"
                      sx={{
                        background: provider.status === 'active'
                          ? colors.status.success
                          : colors.status.error,
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
                  Models: {provider.modelCount} • Requests: {provider.requests}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    background: colors.gradients.primary,
                    '&:hover': {
                      boxShadow: `0 0 20px ${colors.primary.glow}`,
                    },
                  }}
                >
                  Configure
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ModelProviderManager;
```

**Ключові зміни:**
- ✅ Додано `useNexusTheme()` hook
- ✅ Використано `colors` замість hardcoded значень
- ✅ Додано gradient текст для заголовків
- ✅ Додано glow ефекти для hover
- ✅ Додано smooth transitions
- ✅ Відображення поточної теми в UI

---

## 📊 3. DashboardsPage

```tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
} from '@mui/material';
import { Dashboard, OpenInNew } from '@mui/icons-material';
import { useNexusTheme } from '../../contexts/ThemeContext';

const DashboardsPage: React.FC = () => {
  const { colors, currentTheme } = useNexusTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.background.default,
        transition: 'background 0.5s ease',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: colors.gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 20px ${colors.primary.glow}`,
              }}
            >
              <Dashboard sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  background: colors.gradients.primary,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                📊 Dashboards
              </Typography>
              <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                OpenSearch Dashboards Embedding • Theme: {currentTheme.name}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Dashboard Grid */}
        <Grid container spacing={3}>
          {dashboards.map((dashboard) => (
            <Grid item xs={12} md={6} lg={4} key={dashboard.id}>
              <Card
                sx={{
                  background: colors.background.paper,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    boxShadow: `0 12px 40px ${colors.primary.glow}`,
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ color: colors.text.primary }}>
                      {dashboard.title}
                    </Typography>
                    <IconButton
                      size="small"
                      sx={{
                        color: colors.primary.main,
                        '&:hover': {
                          background: colors.primary.glow,
                        },
                      }}
                    >
                      <OpenInNew />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    {dashboard.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const dashboards = [
  { id: '1', title: 'System Overview', description: 'Загальний огляд системи' },
  { id: '2', title: 'Model Performance', description: 'Продуктивність моделей' },
  { id: '3', title: 'Usage Analytics', description: 'Аналітика використання' },
];

export default DashboardsPage;
```

---

## 📥 4. IngestPage

```tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useNexusTheme } from '../../contexts/ThemeContext';
import FileDropzone from './FileDropzone';
import LinkCollector from './LinkCollector';
import TelegramConnector from './TelegramConnector';

const IngestPage: React.FC = () => {
  const { colors, currentTheme } = useNexusTheme();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.background.default,
        transition: 'background 0.5s ease',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: colors.gradients.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 20px ${colors.secondary.glow}`,
              }}
            >
              <CloudUpload sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  background: colors.gradients.secondary,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                📥 Ingest Hub
              </Typography>
              <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                Multi-source data ingestion • Theme: {currentTheme.name}
              </Typography>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: colors.text.secondary,
                fontWeight: 600,
                '&.Mui-selected': {
                  color: colors.primary.main,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary.main,
                height: 3,
                borderRadius: 2,
                boxShadow: `0 0 12px ${colors.primary.glow}`,
              },
            }}
          >
            <Tab label="📁 Files" />
            <Tab label="🔗 Links" />
            <Tab label="📱 Telegram" />
            <Tab label="📊 Status" />
          </Tabs>
        </Box>

        {/* Content */}
        <Card
          sx={{
            background: colors.background.paper,
            border: `1px solid ${colors.border.light}`,
            borderRadius: 4,
            p: 3,
          }}
        >
          {activeTab === 0 && <FileDropzone />}
          {activeTab === 1 && <LinkCollector />}
          {activeTab === 2 && <TelegramConnector />}
          {activeTab === 3 && <div>Status content</div>}
        </Card>
      </Container>
    </Box>
  );
};

export default IngestPage;
```

---

## 🧭 5. Navigation/Header

```tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import {
  Menu,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';
import { useNexusTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const { colors, currentTheme } = useNexusTheme();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: colors.background.paper,
        borderBottom: `1px solid ${colors.border.light}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: colors.gradients.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${colors.primary.glow}`,
            }}
          >
            🚀
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                background: colors.gradients.primary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Predator12 Nexus
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              {currentTheme.icon} {currentTheme.name}
            </Typography>
          </Box>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            sx={{
              color: colors.text.primary,
              '&:hover': {
                background: colors.primary.glow,
                color: colors.primary.main,
              },
            }}
          >
            Dashboards
          </Button>
          <Button
            sx={{
              color: colors.text.primary,
              '&:hover': {
                background: colors.primary.glow,
                color: colors.primary.main,
              },
            }}
          >
            Models
          </Button>
          <Button
            sx={{
              color: colors.text.primary,
              '&:hover': {
                background: colors.primary.glow,
                color: colors.primary.main,
              },
            }}
          >
            Ingest
          </Button>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
          <IconButton
            sx={{
              color: colors.text.primary,
              '&:hover': {
                background: colors.primary.glow,
              },
            }}
          >
            <Notifications />
          </IconButton>
          <IconButton
            sx={{
              color: colors.text.primary,
              '&:hover': {
                background: colors.primary.glow,
              },
            }}
          >
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
```

---

## ✅ Checklist інтеграції

### Для кожного компонента:

- [ ] Import `useNexusTheme` hook
- [ ] Destructure `colors` та `currentTheme`
- [ ] Замінити hardcoded кольори на `colors.*`
- [ ] Додати transitions для плавності
- [ ] Використати gradients для заголовків
- [ ] Додати glow effects для hover
- [ ] Протестувати на всіх темах
- [ ] Перевірити responsive layout

### Глобальна інтеграція:

- [ ] Оновити `App.tsx` з `NexusThemeProvider`
- [ ] Додати `ThemeSwitcher` компонент
- [ ] Видалити старі theme imports
- [ ] Оновити всі header компоненти
- [ ] Оновити navigation/sidebar
- [ ] Оновити modals/dialogs
- [ ] Тестування на різних екранах
- [ ] Перевірка LocalStorage

---

## 🎯 Результат

Після інтеграції:
- ✅ **7 тем** доступні в одному кліку
- ✅ **Smooth transitions** між темами
- ✅ **Збереження** обраної теми
- ✅ **Единий стиль** по всьому додатку
- ✅ **TypeScript** типізація
- ✅ **Production-ready** код

---

**File:** `THEME_INTEGRATION_EXAMPLES.md`  
**Version:** 1.0.0  
**Status:** ✅ Ready to implement

🎨 Predator12 Nexus Core V3 - Theme Integration
