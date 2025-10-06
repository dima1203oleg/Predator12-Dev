# 🚀 Міграційний гід: Python 3.11 + Modern Stack

**Дата:** 6 жовтня 2025 р.  
**Статус:** Ready for migration

---

## 📋 Що змінилося

### Основні оновлення:

1. **Pydantic v2** (1.x → 2.11.10)
2. **SQLAlchemy 2.0** (1.4.x → 2.0.43)
3. **FastAPI 0.118** (останній стабільний)
4. **psycopg3** (psycopg2 → psycopg[binary,pool])
5. **Modern async patterns** (uvloop, orjson, aiocache)

---

## 🔄 Покроковий план міграції

### Крок 1: Backup поточного середовища

```bash
# Збережіть поточний venv
cd backend
mv venv venv-old

# Backup поточних залежностей
pip freeze > requirements-old.txt

# Backup бази даних
pg_dump -U predator -d predator11 > backup-$(date +%Y%m%d).sql
```

### Крок 2: Створення нового Python 3.11 venv

```bash
# Створіть новий venv з Python 3.11
python3.11 -m venv venv

# Активуйте
source venv/bin/activate

# Перевірте версію
python --version  # має бути 3.11.x
```

### Крок 3: Встановлення нових залежностей

```bash
# Оновіть pip
pip install --upgrade pip setuptools wheel

# Встановіть нові залежності
pip install -r requirements-311-modern.txt

# Перевірте встановлення
pip list
```

### Крок 4: Код-міграція

#### 4.1 Pydantic v2 зміни

**Було (v1):**
```python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int
    
    class Config:
        orm_mode = True

# Використання
user_dict = user.dict()
user_json = user.json()
```

**Стало (v2):**
```python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # замість orm_mode
    
    name: str
    age: int

# Використання
user_dict = user.model_dump()        # замість .dict()
user_json = user.model_dump_json()   # замість .json()
user_copy = user.model_copy()        # замість .copy()
```

**Основні зміни:**
- `.dict()` → `.model_dump()`
- `.json()` → `.model_dump_json()`
- `.parse_obj()` → `.model_validate()`
- `.parse_raw()` → `.model_validate_json()`
- `Config.orm_mode` → `ConfigDict(from_attributes=True)`
- `@validator` → `@field_validator`
- `@root_validator` → `@model_validator`

#### 4.2 SQLAlchemy 2.0 зміни

**Було (1.4):**
```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)

# Query
users = session.query(User).filter(User.name == "John").all()
```

**Стало (2.0):**
```python
from sqlalchemy import select
from sqlalchemy.orm import Mapped, mapped_column, Session

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

# Query (modern style)
stmt = select(User).where(User.name == "John")
users = session.scalars(stmt).all()

# Або async
async with AsyncSession(engine) as session:
    result = await session.execute(stmt)
    users = result.scalars().all()
```

**Основні зміни:**
- `Column` → `mapped_column` + type hints
- `session.query()` → `select()` + `session.execute()`
- Додано async підтримку через `AsyncSession`
- `declarative_base()` → `DeclarativeBase` class

#### 4.3 FastAPI зміни

**Було:**
```python
from fastapi import FastAPI, Depends
from pydantic import BaseModel

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    return UserResponse.from_orm(user)
```

**Стало:**
```python
from fastapi import FastAPI, Depends
from pydantic import BaseModel

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    return UserResponse.model_validate(user)  # замість from_orm
```

#### 4.4 psycopg3 зміни

**Було (psycopg2):**
```python
DATABASE_URL = "postgresql://user:pass@localhost/db"
engine = create_engine(DATABASE_URL)
```

**Стало (psycopg3):**
```python
# Для async
DATABASE_URL = "postgresql+psycopg://user:pass@localhost/db"
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

# Для sync (якщо потрібно)
DATABASE_URL = "postgresql+psycopg://user:pass@localhost/db"
engine = create_engine(DATABASE_URL)
```

---

## 🧪 Тестування після міграції

### 1. Тести імпортів

```bash
cd backend
source venv/bin/activate
python -c "import fastapi, pydantic, sqlalchemy; print('OK')"
```

### 2. Перевірка моделей

```python
# test_models.py
from app.models import User

def test_pydantic_v2():
    user = User(name="Test", age=30)
    assert user.model_dump() == {"name": "Test", "age": 30}
    print("✅ Pydantic v2 works")

def test_sqlalchemy_2():
    from sqlalchemy import select
    stmt = select(User)
    print(f"✅ SQLAlchemy 2.0 works: {stmt}")
```

### 3. Запуск smoke тестів

```bash
cd backend
pytest tests/ -v
```

### 4. Перевірка API

```bash
# Запустіть сервер
uvicorn app.main:app --reload

# В іншому терміналі
curl http://localhost:8000/docs  # Swagger UI
curl http://localhost:8000/health
```

---

## 🔧 Оновлення .env

```bash
# Оновіть database URL для psycopg3
DATABASE_URL=postgresql+psycopg://predator:password@localhost:5432/predator11

# Для async
DATABASE_URL=postgresql+psycopg://predator:password@localhost:5432/predator11

# Додайте нові налаштування
UVLOOP_ENABLED=true
ORJSON_ENABLED=true
LOG_LEVEL=INFO
```

---

## 📝 Checklist міграції

### Pre-migration:
- [ ] Backup бази даних
- [ ] Backup поточного venv
- [ ] Commit всіх змін у git
- [ ] Документуйте поточну версію залежностей

### Migration:
- [ ] Створіть новий venv з Python 3.11
- [ ] Встановіть requirements-311-modern.txt
- [ ] Оновіть Pydantic моделі (v1 → v2)
- [ ] Оновіть SQLAlchemy моделі (1.4 → 2.0)
- [ ] Оновіть database URL для psycopg3
- [ ] Оновіть `.env` файл

### Post-migration:
- [ ] Запустіть тести
- [ ] Перевірте API endpoints
- [ ] Перевірте database queries
- [ ] Запустіть smoke тести
- [ ] Перевірте performance
- [ ] Оновіть документацію

---

## 🚨 Типові проблеми та рішення

### Проблема 1: ImportError для Pydantic

**Помилка:**
```
AttributeError: 'User' object has no attribute 'dict'
```

**Рішення:**
```python
# Замініть .dict() на .model_dump()
user_dict = user.model_dump()
```

### Проблема 2: SQLAlchemy query не працює

**Помилка:**
```
AttributeError: 'AsyncSession' object has no attribute 'query'
```

**Рішення:**
```python
# Використовуйте select() замість session.query()
from sqlalchemy import select
stmt = select(User).where(User.id == user_id)
result = await session.execute(stmt)
user = result.scalar_one_or_none()
```

### Проблема 3: psycopg3 connection URL

**Помилка:**
```
NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgres
```

**Рішення:**
```python
# Додайте +psycopg до URL
DATABASE_URL = "postgresql+psycopg://user:pass@localhost/db"
```

### Проблема 4: Pydantic Config

**Помилка:**
```
TypeError: BaseModel.Config is deprecated
```

**Рішення:**
```python
# Використовуйте model_config замість class Config
from pydantic import ConfigDict

class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)
```

---

## 📚 Корисні ресурси

- [Pydantic v2 Migration Guide](https://docs.pydantic.dev/latest/migration/)
- [SQLAlchemy 2.0 Migration](https://docs.sqlalchemy.org/en/20/changelog/migration_20.html)
- [psycopg3 Documentation](https://www.psycopg.org/psycopg3/docs/)
- [FastAPI with SQLAlchemy 2.0](https://fastapi.tiangolo.com/tutorial/sql-databases/)

---

## 🎯 Rollback план

Якщо щось піде не так:

```bash
# 1. Видаліть новий venv
rm -rf venv

# 2. Поверніть старий venv
mv venv-old venv

# 3. Активуйте старий venv
source venv/bin/activate

# 4. Відновіть базу даних (якщо потрібно)
psql -U predator -d predator11 < backup-YYYYMMDD.sql
```

---

## ✅ Фінальна перевірка

```bash
# 1. Перевірка версій
python --version  # 3.11.x
pip show fastapi  # 0.118.0
pip show pydantic  # 2.11.10
pip show sqlalchemy  # 2.0.43

# 2. Запуск тестів
pytest tests/ -v

# 3. Запуск сервера
uvicorn app.main:app --reload

# 4. Smoke тести
cd ../smoke_tests
python3.11 python_smoke.py
```

---

**Готово!** Тепер ваш проект використовує найсучасніший Python 3.11 стек! 🎉
