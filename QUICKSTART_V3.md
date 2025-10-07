# 🚀 PREDATOR12 Dashboard V3 - Quick Start

## ✨ Що нового в V3?

### 4 нові компоненти:
1. 🔍 **SearchBar** - real-time пошук сервісів
2. 🎯 **FilterChip** - фільтрація по категоріях  
3. 📢 **AlertNotification** - система сповіщень
4. 🔎 **ServiceModal** - детальний перегляд сервісу

---

## 🏃‍♂️ Швидкий старт

### 1. Запустити Dev Server:
```bash
cd predator12-local/frontend
npm run dev
```

**URL**: http://localhost:5091

### 2. Відкрити в браузері:
```bash
open http://localhost:5091
```

### 3. Спробувати функції:
- Ввести "postgres" в search bar
- Клікнути на filter chip "Database"
- Клікнути на Service Card для деталей
- Закрити alert у правому куті

---

## 📚 Документація

### Повна документація:
1. **WEB_INTERFACE_ENHANCEMENT_V3.md** - технічний звіт
2. **DASHBOARD_VISUAL_GUIDE_V3.md** - візуальний гайд
3. **FINAL_REPORT_V3.md** - фінальний звіт
4. **demo-dashboard-v3.sh** - інтерактивна демонстрація

### Запустити демо:
```bash
./demo-dashboard-v3.sh
```

---

## 🎯 Основні функції

### 🔍 Пошук
- Real-time search по всіх сервісах
- Case-insensitive
- Миттєвий відгук (< 10ms)

### 🎯 Фільтри
8 категорій з динамічними лічильниками:
- All Services (25)
- Core (5)
- Database (4)
- Search (2)
- AI/ML (1)
- Monitoring (7)
- System (2)
- Security (1)

### 🔎 Service Modal
Детальна інформація про кожен сервіс:
- Uptime
- Requests/min
- Response time
- Last check
- Action buttons (Logs, Restart, Configure)

### 📢 Alerts
Система сповіщень з 3 типами:
- ❌ Error (червоний)
- ⚠️ Warning (жовтий)
- ℹ️ Info (синій)

---

## 🏗️ Production Build

```bash
npm run build
```

**Output**: `dist/`  
**URL**: http://localhost:3000 (Docker)

---

## 🎨 Features

✅ Real-time пошук  
✅ Фільтрація по ��атегоріях  
✅ Модальні вікна з деталями  
✅ Система сповіщень  
✅ Плавні анімації  
✅ Responsive дизайн  
✅ Glassmorphism UI  
✅ 25 сервісів з метриками  

---

## 🐛 Troubleshooting

### Dev server не запускається:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port зайнятий:
```bash
lsof -i :5091
kill -9 <PID>
```

---

## 📞 Підтримка

**Документація**: `/Users/dima/Documents/Predator12/`  
**Dev Server**: http://localhost:5091  
**Production**: http://localhost:3000  

---

**Версія**: 3.0  
**Статус**: ✅ Production Ready  
**Дата**: 6 Жовтня 2025

