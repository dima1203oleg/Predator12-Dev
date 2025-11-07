# 🚀 CYBER-ACE Quick Start

**Версія:** 1.0  
**Статус:** Ready to Launch 🎯

---

## ⚡ Швидкий Запуск (5 хвилин)

### Варіант 1: Автоматичний 🤖

```bash
cd /Users/dima/Documents/Predator12/predator12-local
./cyber-ace-start.sh
```

### Варіант 2: Ручний 👨‍💻

**Terminal 1 - Backend:**

```bash
cd /Users/dima/Documents/Predator12/predator12-local/backend
python3 -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd /Users/dima/Documents/Predator12/predator12-local/frontend
npm run dev
```

**Terminal 3 - Tests:**

```bash
cd /Users/dima/Documents/Predator12/predator12-local
./test-cyber-ace-integration.sh
```

---

## 🌐 URL

- 🏠 Frontend: <http://localhost:5173>
- 🤖 CYBER-ACE: <http://localhost:5173/cyber-ace>
- 📚 API Docs: <http://localhost:8000/docs>
- ❤️ Health: <http://localhost:8000/api/cyber-ace/health>

---

## 📚 Документація

- 📚 **Індекс:** `📚_CYBER_ACE_DOCS_INDEX.md` ← Почніть звідси!
- ⚡ **Запуск:** `⚡_ЗАПУСК_CYBER_ACE.md`
- 🎯 **План:** `🎯_ACTION_PLAN_CYBER_ACE.md`
- 📊 **Summary:** `📊_CYBER_ACE_FINAL_SUMMARY.md`

---

## 🆘 Проблеми?

```bash
# Показати швидкі команди
./cyber-ace-quick-commands.sh

# Troubleshooting
cat 🎯_ACTION_PLAN_CYBER_ACE.md
```

---

## ✅ Checklist

- [ ] Backend запущено (port 8000)
- [ ] Frontend запущено (port 5173)
- [ ] Tests пройшли (3/3)
- [ ] UI працює

---

**🎉 Готово! Насолоджуйтесь CYBER-ACE!**
