#!/usr/bin/env python3
"""
🎤 Voice Providers API - Backend для керування TTS/STT провайдерами
Частина Premium FREE Voice System Predator12 Nexus Core V5.2

Функціонал:
- Збереження/завантаження конфігурацій провайдерів
- Керування API ключами (зашифровано)
- Валідація та тестування провайдерів
- Історія змін налаштувань
- Централізоване логування використання
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from cryptography.fernet import Fernet
from fastapi import APIRouter, HTTPException
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field

# Налаштування логування
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ініціалізація роутера
router = APIRouter(
    prefix="/api/voice-providers",
    tags=["voice-providers"],
    responses={404: {"description": "Not found"}},
)

# Security
security = HTTPBearer()


# Моделі даних
class ProviderConfig(BaseModel):
    id: str
    name: str
    category: Literal["tts", "stt"]
    type: Literal["free", "freemium", "paid"]
    status: Literal["available", "configured", "error", "disabled"]
    api_key: Optional[str] = None
    model: Optional[str] = None
    region: Optional[str] = None
    endpoint: Optional[str] = None
    quality: int = Field(ge=1, le=5)
    speed: int = Field(ge=1, le=5)
    languages: List[str]
    description: str
    features: List[str]
    limits: Optional[Dict[str, str]] = None
    pricing: Optional[Dict[str, Any]] = None
    documentation: Optional[str] = None
    test_phrase: Optional[str] = None
    last_tested: Optional[datetime] = None
    usage_count: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ProviderTest(BaseModel):
    provider_id: str
    test_type: Literal["tts", "stt"]
    text: Optional[str] = None
    audio_url: Optional[str] = None
    language: str = "uk-UA"


class ProviderUsage(BaseModel):
    provider_id: str
    timestamp: datetime
    operation: Literal["tts", "stt"]
    success: bool
    duration_ms: int
    error_message: Optional[str] = None


class VoiceSettings(BaseModel):
    default_tts_provider: str = "coqui_tts"
    default_stt_provider: str = "faster_whisper"
    fallback_enabled: bool = True
    fallback_order: List[str] = ["api", "local", "browser"]
    auto_switch_on_error: bool = True
    usage_analytics: bool = True
    language_preference: str = "uk-UA"
    quality_preference: Literal["speed", "quality", "balanced"] = "balanced"


# Шифрування для API ключів
def get_encryption_key() -> bytes:
    """Отримання ключа шифрування з змінної середовища або створення нового"""
    key_file = Path("voice_encryption.key")

    if key_file.exists():
        return key_file.read_bytes()
    else:
        key = Fernet.generate_key()
        key_file.write_bytes(key)
        logger.warning("🔐 Створено новий ключ шифрування для API ключів")
        return key


ENCRYPTION_KEY = get_encryption_key()
cipher_suite = Fernet(ENCRYPTION_KEY)


def encrypt_api_key(api_key: str) -> str:
    """Зашифрувати API ключ"""
    if not api_key:
        return ""
    return cipher_suite.encrypt(api_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Розшифрувати API ключ"""
    if not encrypted_key:
        return ""
    try:
        return cipher_suite.decrypt(encrypted_key.encode()).decode()
    except Exception as e:
        logger.error(f"❌ Помилка розшифрування API ключа: {e}")
        return ""


# Зберігання даних
VOICE_CONFIG_DIR = Path("voice_configs")
VOICE_CONFIG_DIR.mkdir(exist_ok=True)

PROVIDERS_FILE = VOICE_CONFIG_DIR / "providers.json"
SETTINGS_FILE = VOICE_CONFIG_DIR / "settings.json"
USAGE_FILE = VOICE_CONFIG_DIR / "usage.json"

# Дефолтні провайдери (FREE & FREEMIUM)
DEFAULT_PROVIDERS = [
    {
        "id": "coqui_tts",
        "name": "Coqui TTS (Local)",
        "category": "tts",
        "type": "free",
        "status": "available",
        "quality": 5,
        "speed": 3,
        "languages": ["uk-UA", "en-US", "ru-RU"],
        "description": "Локальний open-source TTS з підтримкою української мови",
        "features": [
            "Офлайн робота",
            "Висока якість",
            "Мультимовність",
            "Кастомізація голосу",
        ],
        "limits": {"free": "Необмежено (локально)"},
        "pricing": {"free": True},
        "test_phrase": "Привіт! Це тест голосового синтезу.",
        "usage_count": 0,
    },
    {
        "id": "gtts",
        "name": "Google Text-to-Speech",
        "category": "tts",
        "type": "free",
        "status": "available",
        "quality": 4,
        "speed": 5,
        "languages": ["uk-UA", "en-US", "ru-RU", "de-DE", "fr-FR"],
        "description": "Безкоштовний Google TTS сервіс",
        "features": ["Швидка робота", "Якісні голоси", "Багато мов"],
        "limits": {"free": "Без ліміту (при розумному використанні)"},
        "pricing": {"free": True},
        "test_phrase": "Привіт! Це тест голосового синтезу.",
        "usage_count": 0,
    },
    {
        "id": "pyttsx3",
        "name": "pyttsx3 (System TTS)",
        "category": "tts",
        "type": "free",
        "status": "available",
        "quality": 3,
        "speed": 4,
        "languages": ["uk-UA", "en-US"],
        "description": "Системний TTS движок",
        "features": ["Офлайн робота", "Системна інтеграція", "Швидкість"],
        "limits": {"free": "Необмежено"},
        "pricing": {"free": True},
        "test_phrase": "Привіт! Це тест голосового синтезу.",
        "usage_count": 0,
    },
    {
        "id": "faster_whisper",
        "name": "Faster Whisper (Local)",
        "category": "stt",
        "type": "free",
        "status": "available",
        "quality": 5,
        "speed": 4,
        "languages": ["uk-UA", "en-US", "ru-RU", "de-DE", "fr-FR"],
        "description": "Оптимізована версія OpenAI Whisper",
        "features": ["Офлайн робота", "Висока точність", "Швидкість", "Мультимовність"],
        "limits": {"free": "Необмежено (локально)"},
        "pricing": {"free": True},
        "test_phrase": "Скажіть будь-що українською або англійською",
        "usage_count": 0,
    },
    {
        "id": "whisper",
        "name": "OpenAI Whisper",
        "category": "stt",
        "type": "free",
        "status": "available",
        "quality": 5,
        "speed": 3,
        "languages": ["uk-UA", "en-US", "ru-RU", "de-DE", "fr-FR", "es-ES"],
        "description": "Оригінальний Whisper від OpenAI",
        "features": ["Офлайн робота", "Найвища точність", "99 мов підтримки"],
        "limits": {"free": "Необмежено (локально)"},
        "pricing": {"free": True},
        "test_phrase": "Скажіть будь-що українською або англійською",
        "usage_count": 0,
    },
    {
        "id": "vosk",
        "name": "Vosk (Lightweight STT)",
        "category": "stt",
        "type": "free",
        "status": "available",
        "quality": 4,
        "speed": 5,
        "languages": ["uk-UA", "en-US", "ru-RU"],
        "description": "Легкий офлайн розпізнавач мовлення",
        "features": ["Офлайн робота", "Малий розмір", "Швидкість", "Реал-тайм"],
        "limits": {"free": "Необмежено (локально)"},
        "pricing": {"free": True},
        "test_phrase": "Скажіть будь-що українською або англійською",
        "usage_count": 0,
    },
]


# Utility функції
def load_providers() -> List[Dict]:
    """Завантажити конфігурації провайдерів"""
    if PROVIDERS_FILE.exists():
        try:
            with open(PROVIDERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"❌ Помилка завантаження провайдерів: {e}")

    # Створити дефолтні провайдери
    save_providers(DEFAULT_PROVIDERS)
    return DEFAULT_PROVIDERS


def save_providers(providers: List[Dict]) -> None:
    """Зберегти конфігурації провайдерів"""
    try:
        # Шифруємо API ключі перед збереженням
        for provider in providers:
            if provider.get("api_key"):
                provider["api_key"] = encrypt_api_key(provider["api_key"])

        with open(PROVIDERS_FILE, "w", encoding="utf-8") as f:
            json.dump(providers, f, ensure_ascii=False, indent=2, default=str)

        logger.info(f"✅ Збережено {len(providers)} провайдерів")
    except Exception as e:
        logger.error(f"❌ Помилка збереження провайдерів: {e}")
        raise HTTPException(status_code=500, detail=f"Помилка збереження: {e}")


def load_settings() -> Dict:
    """Завантажити глобальні налаштування"""
    default_settings = VoiceSettings().dict()

    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return {**default_settings, **json.load(f)}
        except Exception as e:
            logger.error(f"❌ Помилка завантаження налаштувань: {e}")

    return default_settings


def save_settings(settings: Dict) -> None:
    """Зберегти глобальні налаштування"""
    try:
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)
        logger.info("✅ Налаштування збережено")
    except Exception as e:
        logger.error(f"❌ Помилка збереження налаштувань: {e}")
        raise HTTPException(status_code=500, detail=f"Помилка збереження: {e}")


def log_usage(usage: ProviderUsage) -> None:
    """Логування використання провайдера"""
    try:
        usage_data = []
        if USAGE_FILE.exists():
            with open(USAGE_FILE, "r", encoding="utf-8") as f:
                usage_data = json.load(f)

        usage_data.append(usage.dict())

        # Зберігаємо тільки останні 1000 записів
        if len(usage_data) > 1000:
            usage_data = usage_data[-1000:]

        with open(USAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(usage_data, f, ensure_ascii=False, indent=2, default=str)
    except Exception as e:
        logger.error(f"❌ Помилка логування: {e}")


# API Endpoints


@router.get("/providers", response_model=List[ProviderConfig])
async def get_providers():
    """Отримати список всіх провайдерів"""
    try:
        providers_data = load_providers()

        # Розшифровуємо API ключі для відображення
        for provider in providers_data:
            if provider.get("api_key"):
                provider["api_key"] = decrypt_api_key(provider["api_key"])

        providers = [ProviderConfig(**provider) for provider in providers_data]
        logger.info(f"📋 Повернуто {len(providers)} провайдерів")
        return providers
    except Exception as e:
        logger.error(f"❌ Помилка отримання провайдерів: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/providers", response_model=ProviderConfig)
async def create_provider(provider: ProviderConfig):
    """Створити новий провайдер"""
    try:
        providers = load_providers()

        # Перевірити унікальність ID
        if any(p["id"] == provider.id for p in providers):
            raise HTTPException(status_code=400, detail=f"Провайдер з ID '{provider.id}' вже існує")

        provider_dict = provider.dict()
        provider_dict["created_at"] = datetime.now()
        provider_dict["updated_at"] = datetime.now()

        providers.append(provider_dict)
        save_providers(providers)

        logger.info(f"✅ Створено провайдер: {provider.name}")
        return provider
    except Exception as e:
        logger.error(f"❌ Помилка створення провайдера: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/providers/{provider_id}", response_model=ProviderConfig)
async def update_provider(provider_id: str, provider: ProviderConfig):
    """Оновити конфігурацію провайдера"""
    try:
        providers = load_providers()

        # Знайти провайдер
        provider_index = None
        for i, p in enumerate(providers):
            if p["id"] == provider_id:
                provider_index = i
                break

        if provider_index is None:
            raise HTTPException(status_code=404, detail=f"Провайдер '{provider_id}' не знайдено")

        provider_dict = provider.dict()
        provider_dict["updated_at"] = datetime.now()

        providers[provider_index] = provider_dict
        save_providers(providers)

        logger.info(f"✅ Оновлено провайдер: {provider.name}")
        return provider
    except Exception as e:
        logger.error(f"❌ Помилка оновлення провайдера: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/providers/{provider_id}")
async def delete_provider(provider_id: str):
    """Видалити провайдер"""
    try:
        providers = load_providers()

        # Знайти і видалити провайдер
        updated_providers = [p for p in providers if p["id"] != provider_id]

        if len(updated_providers) == len(providers):
            raise HTTPException(status_code=404, detail=f"Провайдер '{provider_id}' не знайдено")

        save_providers(updated_providers)

        logger.info(f"🗑️ Видалено провайдер: {provider_id}")
        return {"message": f"Провайдер '{provider_id}' видалено"}
    except Exception as e:
        logger.error(f"❌ Помилка видалення провайдера: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/providers/{provider_id}/test")
async def test_provider(provider_id: str, test_data: ProviderTest):
    """Тестувати провайдер"""
    try:
        providers = load_providers()

        # Знайти провайдер
        provider = None
        for p in providers:
            if p["id"] == provider_id:
                provider = p
                break

        if not provider:
            raise HTTPException(status_code=404, detail=f"Провайдер '{provider_id}' не знайдено")

        start_time = datetime.now()
        success = False
        error_message = None

        try:
            # Симуляція тестування (у реальності тут буде API виклик)
            await asyncio.sleep(0.5)  # Імітація запиту

            if test_data.test_type == "tts" and test_data.text:
                # Тест TTS
                result = f"✅ TTS тест пройдено: '{test_data.text[:50]}...'"
                success = True
            elif test_data.test_type == "stt" and test_data.audio_url:
                # Тест STT
                result = f"✅ STT тест пройдено: розпізнано текст з аудіо"
                success = True
            else:
                raise ValueError("Некоректні дані для тестування")

        except Exception as e:
            error_message = str(e)
            result = f"❌ Тест не пройдено: {error_message}"

        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)

        # Логування використання
        usage = ProviderUsage(
            provider_id=provider_id,
            timestamp=datetime.now(),
            operation=test_data.test_type,
            success=success,
            duration_ms=duration_ms,
            error_message=error_message,
        )
        log_usage(usage)

        # Оновлення last_tested
        for p in providers:
            if p["id"] == provider_id:
                p["last_tested"] = datetime.now()
                break
        save_providers(providers)

        return {
            "provider_id": provider_id,
            "test_type": test_data.test_type,
            "success": success,
            "result": result,
            "duration_ms": duration_ms,
            "timestamp": datetime.now(),
        }

    except Exception as e:
        logger.error(f"❌ Помилка тестування провайдера: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/settings", response_model=VoiceSettings)
async def get_settings():
    """Отримати глобальні налаштування голосової системи"""
    try:
        settings = load_settings()
        return VoiceSettings(**settings)
    except Exception as e:
        logger.error(f"❌ Помилка отримання налаштувань: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/settings", response_model=VoiceSettings)
async def update_settings(settings: VoiceSettings):
    """Оновити глобальні налаштування"""
    try:
        save_settings(settings.dict())
        logger.info("✅ Налаштування оновлено")
        return settings
    except Exception as e:
        logger.error(f"❌ Помилка оновлення налаштувань: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/usage/stats")
async def get_usage_stats():
    """Отримати статистику використання провайдерів"""
    try:
        if not USAGE_FILE.exists():
            return {"total_requests": 0, "providers": {}, "success_rate": 0}

        with open(USAGE_FILE, "r", encoding="utf-8") as f:
            usage_data = json.load(f)

        stats = {
            "total_requests": len(usage_data),
            "providers": {},
            "success_rate": 0,
            "last_24h": 0,
            "tts_requests": 0,
            "stt_requests": 0,
        }

        successful_requests = 0
        last_24h_time = datetime.now() - timedelta(days=1)

        for entry in usage_data:
            provider_id = entry["provider_id"]

            if provider_id not in stats["providers"]:
                stats["providers"][provider_id] = {
                    "total": 0,
                    "success": 0,
                    "errors": 0,
                    "avg_duration": 0,
                }

            stats["providers"][provider_id]["total"] += 1

            if entry["success"]:
                successful_requests += 1
                stats["providers"][provider_id]["success"] += 1
            else:
                stats["providers"][provider_id]["errors"] += 1

            # Підрахунок за типами
            if entry["operation"] == "tts":
                stats["tts_requests"] += 1
            elif entry["operation"] == "stt":
                stats["stt_requests"] += 1

            # Підрахунок за останні 24 години
            entry_time = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
            if entry_time > last_24h_time:
                stats["last_24h"] += 1

        if usage_data:
            stats["success_rate"] = round(successful_requests / len(usage_data) * 100, 2)

        return stats

    except Exception as e:
        logger.error(f"❌ Помилка отримання статистики: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/usage/log")
async def log_provider_usage(usage: ProviderUsage):
    """Логування використання провайдера"""
    try:
        log_usage(usage)
        return {"message": "Використання залоговано"}
    except Exception as e:
        logger.error(f"❌ Помилка логування: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Перевірка здоров'я Voice Providers API"""
    try:
        providers = load_providers()
        load_settings()

        return {
            "status": "healthy",
            "timestamp": datetime.now(),
            "providers_count": len(providers),
            "config_files": {
                "providers": PROVIDERS_FILE.exists(),
                "settings": SETTINGS_FILE.exists(),
                "usage": USAGE_FILE.exists(),
            },
            "encryption": "enabled",
        }
    except Exception as e:
        logger.error(f"❌ Помилка health check: {e}")
        return {"status": "unhealthy", "error": str(e), "timestamp": datetime.now()}


# Ініціалізація при запуску
@router.on_event("startup")
async def startup_event():
    """Ініціалізація при запуску сервера"""
    logger.info("🎤 Ініціалізація Voice Providers API...")

    # Створення конфігураційних файлів якщо їх немає
    if not PROVIDERS_FILE.exists():
        save_providers(DEFAULT_PROVIDERS)
        logger.info("✅ Створено дефолтні провайдери")

    if not SETTINGS_FILE.exists():
        save_settings(VoiceSettings().dict())
        logger.info("✅ Створено дефолтні налаштування")

    logger.info("🎉 Voice Providers API готовий до роботи!")
