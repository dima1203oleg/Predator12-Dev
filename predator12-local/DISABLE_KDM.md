# 🔧 Відключення старого KDM середовища

**Проблема:** При відкритті терміналу з'являється "Активація середовища KDM..."

**Рішення:** Відключити автоактивацію KDM та перейти на новий Python 3.11 venv

---

## 🔍 Крок 1: Знайти KDM

### Перевірити поточне середовище

```bash
# Хто зараз активний
which python
python -V
pip -V

# Пошук згадок "kdm" у shell конфігах
grep -rn "kdm\|KDM" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.zprofile 2>/dev/null
```

### Варіанти, де може бути KDM

**A) Conda/Mamba**
```bash
conda env list
# Якщо бачите kdm:
conda info --envs | grep kdm
```

**B) Pyenv**
```bash
pyenv versions
pyenv virtualenvs
```

**C) Virtualenv/venv**
```bash
# Пошук директорій
find ~ -maxdepth 3 -type d -name "*kdm*" 2>/dev/null
```

**D) Poetry**
```bash
poetry env list --full-path
```

---

## 🛑 Крок 2: Відключити автоактивацію

### Якщо це Conda

```bash
# Деактивувати
conda deactivate

# Вимкнути автоактивацію base
conda config --set auto_activate_base false

# Видалити kdm environment (опціонально)
conda remove -n kdm --all
```

### Якщо це Pyenv

```bash
# Деактивувати
pyenv deactivate 2>/dev/null || true

# Видалити virtualenv
pyenv virtualenv-delete kdm

# Встановити системний Python за замовчуванням
pyenv global system
```

### Якщо це venv/virtualenv

```bash
# Деактивувати
deactivate

# Видалити директорію
rm -rf /шлях/до/kdm  # знайдіть через find
```

### Якщо це Poetry

```bash
poetry env remove kdm
```

---

## 📝 Крок 3: Очистити shell конфіги

### Відкрити конфіг (зазвичай zsh на macOS)

```bash
nano ~/.zshrc
# або
code ~/.zshrc
```

### Знайти та закоментувати рядки з KDM

Шукайте такі паттерни:

```bash
# Поганий приклад (видаліть/закоментуйте):
source ~/kdm/bin/activate
export VIRTUAL_ENV=~/kdm
conda activate kdm
pyenv activate kdm
```

Закоментуйте їх:

```bash
# source ~/kdm/bin/activate  # DISABLED - switched to Python 3.11
# conda activate kdm  # DISABLED
```

### Застосувати зміни

```bash
source ~/.zshrc
```

---

## ✅ Крок 4: Створити новий Python 3.11 venv

### Автоматично (рекомендовано)

```bash
cd /Users/dima/Documents/Predator12/predator12-local
bash scripts/setup-venv.sh
```

Скрипт:
- Перевірить Python 3.11
- Зробить backup старого venv
- Створить новий venv
- Встановить всі залежності
- Протестує імпорти
- Налаштує VS Code

### Вручну

```bash
cd /Users/dima/Documents/Predator12/predator12-local/backend

# Backup старого venv (якщо існує)
mv venv venv.old.$(date +%Y%m%d)

# Створити новий
python3.11 -m venv venv

# Активувати
source venv/bin/activate

# Перевірити
python --version  # має бути 3.11.x

# Оновити pip
pip install --upgrade pip setuptools wheel

# Встановити залежності
pip install -r requirements-311-modern.txt
```

---

## 🎯 Крок 5: Налаштувати VS Code

### Створити/оновити `.vscode/settings.json`

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "python.analysis.typeCheckingMode": "basic",
  "python.linting.enabled": true,
  "python.formatting.provider": "black"
}
```

### Вибрати інтерпретатор

1. `Cmd+Shift+P` → "Python: Select Interpreter"
2. Обрати: `./backend/venv/bin/python`
3. Перезавантажити VS Code

---

## 🧪 Крок 6: Перевірити

### Термінал

```bash
# Закрити та відкрити новий термінал
# Не має з'явитися "Активація середовища KDM..."

# Перевірити Python
python --version
# Якщо все ще показує старий - активуйте venv:
source backend/venv/bin/activate
python --version  # має бути 3.11.x
```

### Health Check

```bash
cd /Users/dima/Documents/Predator12/predator12-local
source backend/venv/bin/activate
python scripts/health-check.py
```

### Запуск Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

---

## 🔄 Крок 7: Оновити скрипти

### `scripts/start-all.sh`

Додати явну активацію venv:

```bash
#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Активувати venv
source "$PROJECT_ROOT/backend/venv/bin/activate"

# Перевірити версію
python --version

# Далі ваш код...
```

---

## 📋 Чек-лист

- [ ] Знайдено KDM середовище (conda/pyenv/venv)
- [ ] Деактивовано KDM
- [ ] Вимкнено автоактивацію в shell конфігах
- [ ] Перезавантажено термінал
- [ ] Створено новий Python 3.11 venv
- [ ] Встановлено залежності
- [ ] Health check пройдено
- [ ] VS Code налаштовано
- [ ] Скрипти оновлено
- [ ] Backend запускається без помилок

---

## 🆘 Troubleshooting

### Все ще бачу "Активація KDM"

1. Перевірте всі shell конфіги:
   ```bash
   grep -rn "kdm" ~/.zshrc ~/.zprofile ~/.bashrc ~/.bash_profile
   ```

2. Перевірте `/etc/zshrc` та `/etc/profile` (системні):
   ```bash
   sudo grep -n "kdm" /etc/zshrc /etc/profile
   ```

3. Перевірте conda init:
   ```bash
   conda config --show | grep auto_activate
   ```

### Python все ще старий

```bash
# Очистити кеш
hash -r

# Перевірити PATH
echo $PATH | tr ':' '\n'

# Вручну активувати venv
source /Users/dima/Documents/Predator12/predator12-local/backend/venv/bin/activate
```

### Помилки при встановленні пакетів

```bash
# Очистити pip кеш
pip cache purge

# Переустановити
pip install --force-reinstall -r requirements-311-modern.txt
```

---

## ✅ Результат

Після виконання всіх кроків:

1. ✅ Термінал відкривається без "Активація KDM"
2. ✅ Python 3.11 за замовчуванням у проекті
3. ✅ VS Code використовує правильний venv
4. ✅ Всі скрипти працюють коректно
5. ✅ Backend запускається без проблем

**Готово! Чистий Python 3.11 venv для Predator12! 🎉**
