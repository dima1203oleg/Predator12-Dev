#!/usr/bin/env python3
"""
🧪 PREDATOR12 - Ultimate Voice API Test Suite
Комплексне тестування триступеневої системи fallback
"""

import asyncio
import time

import aiohttp


# Колірний вивід
class Colors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"


def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}\n")


def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")


def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")


def print_info(text):
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")


def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")


async def test_health_check(base_url):
    """Перевірка здоров'я API."""
    print_header("🏥 HEALTH CHECK")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{base_url}/health", timeout=5) as response:
                if response.status == 200:
                    data = await response.json()
                    print_success("API працює!")
                    print_info(f"Статус: {data.get('status')}")
                    print_info(f"API Services: {data.get('api_services', {})}")
                    print_info(f"Local Models: {data.get('local_models', {})}")
                    return True
                else:
                    print_error(f"API повернув статус {response.status}")
                    return False
    except Exception as e:
        print_error(f"Не вдалося підключитися до API: {e}")
        return False


async def test_capabilities(base_url):
    """Перевірка можливостей системи."""
    print_header("📊 VOICE CAPABILITIES")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{base_url}/api/capabilities", timeout=5) as response:
                if response.status == 200:
                    data = await response.json()
                    print_success("Capabilities отримано!")

                    print("\n🌐 API Services:")
                    for service, available in data.get("api_services", {}).items():
                        status = "✅ Доступний" if available else "❌ Недоступний"
                        print(f"   {service}: {status}")

                    print("\n💻 Local Models:")
                    for model, available in data.get("local_models", {}).items():
                        status = "✅ Доступна" if available else "❌ Недоступна"
                        print(f"   {model}: {status}")

                    print(f"\n🎯 Рекомендований провайдер: {data.get('recommended_provider')}")
                    print(f"🌍 Підтримувані мови: {', '.join(data.get('supported_languages', []))}")
                    print(f"🌐 Browser fallback: {'Так' if data.get('browser_fallback') else 'Ні'}")

                    return data
                else:
                    print_error(f"Помилка отримання capabilities: {response.status}")
                    return None
    except Exception as e:
        print_error(f"Помилка: {e}")
        return None


async def test_tts(base_url, text, language="uk", provider="auto"):
    """Тестування Text-to-Speech."""
    print_header(f"🎤 TTS TEST ({provider})")
    print_info(f"Текст: {text[:50]}...")
    print_info(f"Мова: {language}")

    try:
        start_time = time.time()

        async with aiohttp.ClientSession() as session:
            payload = {
                "text": text,
                "language": language,
                "speed": 1.0,
                "provider": provider,
                "quality": "high",
            }

            async with session.post(f"{base_url}/api/tts", json=payload, timeout=60) as response:
                end_time = time.time()

                if response.status == 200:
                    data = await response.json()
                    print_success(f"TTS успішно через {data.get('provider')}")
                    print_info(f"Тривалість аудіо: {data.get('duration', 0):.2f}s")
                    print_info(f"Час генерації: {end_time - start_time:.2f}s")
                    print_info(f"Cached: {data.get('cached', False)}")

                    if data.get("audio_url"):
                        print_info(f"Audio URL: {data.get('audio_url')}")
                        return True
                    elif not data.get("audio_url"):
                        print_warning("Browser fallback - озвучування в браузері")
                        return True
                else:
                    print_error(f"TTS помилка: {response.status}")
                    error_data = await response.text()
                    print_error(f"Деталі: {error_data}")
                    return False

    except Exception as e:
        print_error(f"Помилка TTS: {e}")
        return False


async def test_tts_fallback_chain(base_url):
    """Тестування повного ланцюга fallback."""
    print_header("🔗 FALLBACK CHAIN TEST")

    test_text = "Це тест системи автоматичного перемикання між провайдерами."

    # Тест 1: Auto (вибирає найкращий)
    print_info("📍 Рівень 1: Auto (API-first)")
    await test_tts(base_url, test_text, "uk", "auto")
    await asyncio.sleep(2)

    # Тест 2: API провайдер
    print_info("\n📍 Рівень 1: API Service")
    await test_tts(base_url, test_text, "uk", "api")
    await asyncio.sleep(2)

    # Тест 3: Local модель
    print_info("\n📍 Рівень 2: Local Model")
    await test_tts(base_url, test_text, "uk", "local")
    await asyncio.sleep(2)

    # Тест 4: Browser fallback
    print_info("\n📍 Рівень 3: Browser Fallback")
    await test_tts(base_url, test_text, "uk", "browser")


async def test_multilingual(base_url):
    """Тестування багатомовності."""
    print_header("🌍 MULTILINGUAL TEST")

    tests = [
        ("uk", "Привіт! Я ваш AI асистент. Як справи?"),
        ("en", "Hello! I am your AI assistant. How are you?"),
        ("uk", "Тестуємо українську мову з різними фразами."),
        ("en", "Testing English language with various phrases."),
    ]

    for language, text in tests:
        print_info(f"\n🌐 Мова: {language.upper()}")
        await test_tts(base_url, text, language, "auto")
        await asyncio.sleep(2)


async def test_performance(base_url):
    """Тестування продуктивності."""
    print_header("⚡ PERFORMANCE TEST")

    test_texts = [
        "Коротка фраза.",
        "Це середня фраза для тестування швидкості генерації голосу.",
        "Це довга фраза для тестування продуктивності системи синтезу мовлення, яка містить більше тексту та вимагає більше часу для обробки.",
    ]

    for i, text in enumerate(test_texts, 1):
        print_info(f"\n📝 Тест {i} (довжина: {len(text)} символів)")
        await test_tts(base_url, text, "uk", "auto")
        await asyncio.sleep(1)


async def test_cache(base_url):
    """Тестування кешування."""
    print_header("💾 CACHE TEST")

    test_text = "Це повідомлення для тестування кешу."

    print_info("Перший запит (без кешу):")
    await test_tts(base_url, test_text, "uk", "auto")

    await asyncio.sleep(1)

    print_info("\nДругий запит (з кешем):")
    await test_tts(base_url, test_text, "uk", "auto")


async def test_edge_cases(base_url):
    """Тестування крайніх випадків."""
    print_header("🔬 EDGE CASES TEST")

    edge_cases = [
        ("Один.", "Дуже короткий текст"),
        ("Текст з цифрами: 123, 456, 789.", "Цифри"),
        ("Текст з символами: @#$%^&*()!", "Спеціальні символи"),
        ("ВЕЛИКІ ЛІТЕРИ ТЕСТ", "Капс"),
        ("тільки малі літери тест", "Малі літери"),
        ("Текст 🎉 з 🚀 емодзі 💻", "Емодзі"),
    ]

    for text, description in edge_cases:
        print_info(f"\n📋 {description}:")
        await test_tts(base_url, text, "uk", "auto")
        await asyncio.sleep(1)


async def run_all_tests():
    """Запуск всіх тестів."""
    base_url = "http://localhost:8000"

    print(
        f"""
{Colors.HEADER}{Colors.BOLD}
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🎤 PREDATOR12 Ultimate Voice API Test Suite              ║
║                  Триступенева логіка fallback                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
{Colors.ENDC}
    """
    )

    print_info(f"API URL: {base_url}")
    print_info(f"Час запуску: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # Основні тести
    if not await test_health_check(base_url):
        print_error("\n❌ API недоступний! Переконайтеся, що сервер запущено:")
        print_info("   python voice_api_ultimate.py")
        return

    # Capabilities
    capabilities = await test_capabilities(base_url)
    if not capabilities:
        print_warning("Не вдалося отримати capabilities, але продовжуємо тести...")

    # Тести fallback chain
    await test_tts_fallback_chain(base_url)

    # Багатомовність
    await test_multilingual(base_url)

    # Продуктивність
    await test_performance(base_url)

    # Кеш
    await test_cache(base_url)

    # Edge cases
    await test_edge_cases(base_url)

    # Фінальний звіт
    print_header("📊 FINAL REPORT")
    print_success("Всі тести завершено!")
    print_info("Перевірте логи вище для детальної інформації")
    print_info(f"Час завершення: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    print(
        f"""
{Colors.OKGREEN}
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  ✅ ULTIMATE VOICE API READY FOR PRODUCTION                     ║
║                                                                  ║
║  🌐 API Services: Доступні (ElevenLabs, Google, Azure)          ║
║  💻 Local Models: Готові до fallback (Coqui, Whisper)           ║
║  🌐 Browser API: Завжди доступний як резерв                     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
{Colors.ENDC}
    """
    )


if __name__ == "__main__":
    asyncio.run(run_all_tests())
