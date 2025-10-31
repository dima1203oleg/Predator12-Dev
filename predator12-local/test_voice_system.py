#!/usr/bin/env python3
"""
🧪 PREDATOR12 NEXUS - Voice System Test
Тестування TTS/STT систем
"""

import os
import sys
import time
from pathlib import Path

print("🧪 " + "=" * 50)
print("   PREDATOR12 Voice System Test")
print("=" * 50 + "\n")

# ============================================
# Перевірка імпортів
# ============================================

print("📦 Перевірка встановлених бібліотек...\n")

modules_status = {}

# TTS
try:
    from TTS.api import TTS

    modules_status["TTS"] = "✅ OK"
    print("✅ Coqui TTS встановлено")
except ImportError as e:
    modules_status["TTS"] = f"❌ НЕ ВСТАНОВЛЕНО"
    print(f"❌ Coqui TTS: {e}")

# Whisper
try:
    import whisper

    modules_status["Whisper"] = "✅ OK"
    print("✅ Whisper встановлено")
except ImportError as e:
    modules_status["Whisper"] = f"❌ НЕ ВСТАНОВЛЕНО"
    print(f"❌ Whisper: {e}")

# faster-whisper
try:
    from faster_whisper import WhisperModel

    modules_status["faster-whisper"] = "✅ OK"
    print("✅ faster-whisper встановлено")
except ImportError as e:
    modules_status["faster-whisper"] = f"❌ НЕ ВСТАНОВЛЕНО"
    print(f"❌ faster-whisper: {e}")

# Audio
try:
    import soundfile as sf

    modules_status["soundfile"] = "✅ OK"
    print("✅ soundfile встановлено")
except ImportError as e:
    modules_status["soundfile"] = f"❌ НЕ ВСТАНОВЛЕНО"
    print(f"❌ soundfile: {e}")

try:
    import numpy as np

    modules_status["numpy"] = "✅ OK"
    print("✅ numpy встановлено")
except ImportError as e:
    modules_status["numpy"] = f"❌ НЕ ВСТАНОВЛЕНО"
    print(f"❌ numpy: {e}")

print()

# ============================================
# Тест TTS
# ============================================

if "✅" in modules_status.get("TTS", ""):
    print("🔊 Тестування TTS (Text-to-Speech)...")
    print("-" * 50)

    try:
        print("📥 Завантаження моделі...")
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
        print("✅ Модель завантажена")

        # Створюємо директорію для тестів
        os.makedirs("voice-tests", exist_ok=True)

        # Тест українською
        print("\n🇺🇦 Тест українською мовою...")
        test_text_uk = "Привіт! Я голосовий асистент Нексус. Тестую систему озвучування."
        output_file_uk = "voice-tests/test_uk.wav"

        print(f"   Текст: {test_text_uk}")
        print(f"   Генерація аудіо...")
        start_time = time.time()

        tts.tts_to_file(text=test_text_uk, file_path=output_file_uk, language="uk")

        elapsed = time.time() - start_time
        print(f"✅ Згенеровано за {elapsed:.2f}s")
        print(f"   Файл: {output_file_uk}")

        # Тест англійською
        print("\n🇺🇸 Тест англійською мовою...")
        test_text_en = "Hello! I am the Nexus voice assistant. Testing speech synthesis system."
        output_file_en = "voice-tests/test_en.wav"

        print(f"   Text: {test_text_en}")
        print(f"   Generating audio...")
        start_time = time.time()

        tts.tts_to_file(text=test_text_en, file_path=output_file_en, language="en")

        elapsed = time.time() - start_time
        print(f"✅ Generated in {elapsed:.2f}s")
        print(f"   File: {output_file_en}")

        print("\n✅ TTS тести пройдені успішно!")

    except Exception as e:
        print(f"❌ Помилка TTS тесту: {e}")
else:
    print("⏭️  TTS тести пропущені (модуль не встановлено)")

print()

# ============================================
# Тест STT (якщо є тестові файли)
# ============================================

if "✅" in modules_status.get("faster-whisper", "") or "✅" in modules_status.get("Whisper", ""):
    print("🎤 Тестування STT (Speech-to-Text)...")
    print("-" * 50)

    # Перевіряємо чи є згенеровані аудіо файли
    test_files = []
    if os.path.exists("voice-tests/test_uk.wav"):
        test_files.append(("voice-tests/test_uk.wav", "uk"))
    if os.path.exists("voice-tests/test_en.wav"):
        test_files.append(("voice-tests/test_en.wav", "en"))

    if test_files:
        try:
            # Використовуємо faster-whisper якщо доступно
            if "✅" in modules_status.get("faster-whisper", ""):
                print("📥 Завантаження faster-whisper моделі...")
                from faster_whisper import WhisperModel

                model = WhisperModel("base", device="cpu", compute_type="int8")
                print("✅ Модель завантажена")

                for audio_file, lang in test_files:
                    print(f"\n🔍 Розпізнавання: {audio_file}")
                    start_time = time.time()

                    segments, info = model.transcribe(audio_file, language=lang)
                    text = " ".join([segment.text for segment in segments])

                    elapsed = time.time() - start_time
                    print(f"✅ Розпізнано за {elapsed:.2f}s")
                    print(
                        f"   Мова: {info.language} (вірогідність: {info.language_probability:.2%})"
                    )
                    print(f"   Текст: {text}")

            elif "✅" in modules_status.get("Whisper", ""):
                print("📥 Завантаження Whisper моделі...")
                import whisper

                model = whisper.load_model("base")
                print("✅ Модель завантажена")

                for audio_file, lang in test_files:
                    print(f"\n🔍 Розпізнавання: {audio_file}")
                    start_time = time.time()

                    result = model.transcribe(audio_file, language=lang)

                    elapsed = time.time() - start_time
                    print(f"✅ Розпізнано за {elapsed:.2f}s")
                    print(f"   Мова: {result.get('language', lang)}")
                    print(f"   Текст: {result['text']}")

            print("\n✅ STT тести пройдені успішно!")

        except Exception as e:
            print(f"❌ Помилка STT тесту: {e}")
    else:
        print("ℹ️  Немає тестових аудіо файлів")
        print("   Спочатку запустіть TTS тести для створення файлів")
else:
    print("⏭️  STT тести пропущені (модуль не встановлено)")

print()

# ============================================
# Підсумок
# ============================================

print("=" * 50)
print("📊 Підсумок тестування")
print("=" * 50)

for module, status in modules_status.items():
    print(f"{status:20} {module}")

print()

# Рекомендації
if any("❌" in status for status in modules_status.values()):
    print("⚠️  Деякі модулі не встановлені!")
    print("\n💡 Для встановлення виконайте:")
    print("   ./install-voice-tech.sh")
    print("\n   або вручну:")
    print("   pip install -r voice-requirements.txt")
else:
    print("🎉 Всі модулі встановлені та працюють!")
    print("\n📝 Наступні кроки:")
    print("   1. Запустіть Voice API сервер:")
    print("      python voice_api.py")
    print("   2. Відкрийте документацію:")
    print("      http://localhost:8000/docs")
    print("   3. Інтегруйте з фронтендом")

print("\n" + "=" * 50)
print("✨ Тестування завершено!")
print("=" * 50)
