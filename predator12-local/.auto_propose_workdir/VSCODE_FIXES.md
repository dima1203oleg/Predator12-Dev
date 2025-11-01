# 🔧 VS Code Configuration Fixes

**Дата:** 6 жовтня 2025 р.

Цей файл містить виправлення для всіх помилок та попереджень VS Code у Predator12.

---

## 📋 Проблеми та їх вирішення

### 1. ❌ Comments are not permitted in JSON (settings-local.json)

**Проблема:**
```
Comments are not permitted in JSON.
```

**Рішення:**

Створено новий `/Users/dima/Documents/Predator12/predator12-local/.vscode/settings.json` без коментарів.

**Що змінено:**
- Видалено всі `//` коментарі
- Оновлено шляхи: `.venv` → `backend/venv`
- Додано `python.analysis.extraPaths` для кращої роботи Pylance

**Застосувати:**
```bash
cd /Users/dima/Documents/Predator12/predator12-local/.vscode

# Backup старого (якщо потрібно)
[ -f settings.json ] && mv settings.json settings.json.old

# Використати новий
cp settings-new.json settings.json

# Або просто перезавантажити VS Code - він автоматично підхопить
```

---

### 2. ⚠️  Python debugger deprecation (launch.json)

**Проблема:**
```
This configuration will be deprecated soon.
Please replace `python` with `debugpy` to use the new Python Debugger extension.
```

**Рішення:**

Створено новий `launch.json` з оновленими конфігураціями:

**Було:**
```json
{
    "name": "Python: FastAPI",
    "type": "python",  // deprecated
    ...
}
```

**Стало:**
```json
{
    "name": "Backend: FastAPI (debugpy)",
    "type": "debugpy",  // ✅ new
    "module": "uvicorn",
    ...
}
```

**Нові конфігурації:**
- ✅ Backend: FastAPI (debugpy)
- ✅ Backend: Pytest (debugpy)
- ✅ Backend: Celery Worker (debugpy)
- ✅ Frontend: Next.js Dev (node)
- ✅ Scripts: Health Check (debugpy)
- ✅ Full Stack: Backend + Frontend (compound)

**Застосувати:**
```bash
cd /Users/dima/Documents/Predator12/predator12-local/.vscode

# Backup
mv launch.json launch.json.old

# Використати новий
cp launch-new.json launch.json
```

---

### 3. ⚠️  Node debugger (launch.json)

**Проблема:**
```
Please use type node instead
```

**Рішення:**

Оновлено в новому `launch.json`:
```json
{
    "name": "Frontend: Next.js Dev",
    "type": "node",  // ✅ правильно
    "request": "launch",
    ...
}
```

---

### 4. ❌ Pylance: Import "sqlalchemy"/"psycopg" could not be resolved

**Проблема:**
```
Import "sqlalchemy" could not be resolved
Import "psycopg" could not be resolved
```

**Причина:**
- VS Code дивиться не в той Python interpreter
- Або залежності не встановлені в активному venv

**Рішення:**

#### Крок 1: Створити/перевірити venv

```bash
cd /Users/dima/Documents/Predator12/predator12-local/backend

# Перевірити чи існує
ls -la venv/bin/python

# Якщо немає - створити
python3.11 -m venv venv

# Активувати
source venv/bin/activate

# Перевірити версію
python --version  # має бути 3.11.x

# Встановити залежності
pip install --upgrade pip setuptools wheel
pip install -r requirements-311-modern.txt

# Перевірити встановлення
pip list | grep -E "(sqlalchemy|psycopg|fastapi)"
```

#### Крок 2: Вибрати interpreter у VS Code

**Спосіб A: Command Palette**
1. `Cmd+Shift+P` → `Python: Select Interpreter`
2. Вибрати: `predator12-local/backend/venv/bin/python`
3. Перезавантажити: `Developer: Reload Window`

**Спосіб B: Status Bar**
1. Клік на Python version внизу справа
2. Вибрати правильний venv

**Спосіб C: settings.json (автоматично)**

Вже налаштовано в новому `settings.json`:
```json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python",
    "python.analysis.extraPaths": [
        "${workspaceFolder}/backend",
        "${workspaceFolder}/backend/app"
    ]
}
```

#### Крок 3: Перевірка

```bash
# У VS Code terminal
which python
# Має показати: .../predator12-local/backend/venv/bin/python

python -c "import sqlalchemy; print(sqlalchemy.__version__)"
# Має показати: 2.0.43

python -c "import psycopg; print(psycopg.__version__)"
# Має показати: 3.2.10
```

---

## 🚀 Швидке застосування всіх виправлень

```bash
cd /Users/dima/Documents/Predator12/predator12-local

# 1. Створити venv (якщо немає)
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -U pip && pip install -r requirements-311-modern.txt
cd ..

# 2. Оновити VS Code конфігурацію
cd .vscode

# Backup старих файлів
[ -f settings.json ] && mv settings.json settings.json.backup.$(date +%Y%m%d_%H%M%S)
[ -f launch.json ] && mv launch.json launch.json.backup.$(date +%Y%m%d_%H%M%S)

# Застосувати нові (якщо файли існують)
[ -f settings-new.json ] && cp settings-new.json settings.json
[ -f launch-new.json ] && cp launch-new.json launch.json

cd ..

# 3. Перезавантажити VS Code
# Command Palette → Developer: Reload Window
# Або просто закрити і відкрити знову
```

---

## ✅ Перевірка після виправлення

### 1. Settings перевірка
- Відкрийте `.vscode/settings.json`
- Не має бути помилок JSON
- Перевірте що `python.defaultInterpreterPath` вказує на `backend/venv/bin/python`

### 2. Launch перевірка
- Відкрийте `.vscode/launch.json`
- Всі конфігурації мають `type: debugpy` (для Python) або `type: node` (для JS/TS)
- Спробуйте запустити: `Run and Debug` → `Backend: FastAPI (debugpy)`

### 3. Python interpreter перевірка
```bash
# У VS Code terminal
which python
# Має показати шлях до venv

python --version
# Має показати Python 3.11.x

pip list | head -20
# Має показати встановлені пакети
```

### 4. Imports перевірка
- Відкрийте файл: `backend/app/main.py` (або інший Python файл)
- Pylance НЕ має показувати помилки імпорту
- Автодоповнення має працювати

---

## 🐛 Troubleshooting

### Pylance все ще скаржиться на imports

```bash
# 1. Перевірити активний interpreter
# Внизу справа VS Code має показувати правильний venv

# 2. Перезавантажити Python Language Server
# Command Palette → Python: Restart Language Server

# 3. Очистити кеш Pylance
rm -rf ~/.vscode/extensions/ms-python.vscode-pylance-*/dist/
# Потім перезавантажити VS Code

# 4. Переустановити залежності
cd backend
source venv/bin/activate
pip install --force-reinstall sqlalchemy psycopg fastapi
```

### Debugger не запускається

```bash
# 1. Перевірити що module встановлено
pip list | grep uvicorn
pip list | grep debugpy

# 2. Встановити якщо немає
pip install uvicorn debugpy

# 3. Перевірити launch.json
# cwd має вказувати на backend/
# envFile має існувати
```

### Settings.json показує помилки

```bash
# Перевірити валідність JSON
cd .vscode
python3 -m json.tool settings.json
# Якщо помилка - виправити синтаксис
```

---

## 📚 Додаткові ресурси

- **VS Code Python:** https://code.visualstudio.com/docs/python/python-tutorial
- **debugpy:** https://github.com/microsoft/debugpy
- **Pylance:** https://github.com/microsoft/pylance-release

---

## 📝 Підсумок змін

| Файл | Було | Стало | Зміни |
|------|------|-------|-------|
| settings.json | З коментарями | Без коментарів | Видалено //, оновлено шляхи |
| launch.json | type: python | type: debugpy | Оновлено всі конфігурації |
| Python path | .venv | backend/venv | Правильна структура |
| Imports | ❌ Помилки | ✅ Працює | Вибрано правильний interpreter |

---

**Результат:** Всі помилки VS Code виправлені! ✅

Після застосування виправлень перезавантажте VS Code:
```
Command Palette → Developer: Reload Window
```
