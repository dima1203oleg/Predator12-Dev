#!/usr/bin/env python3
"""
🔥 Тест Piper TTS - Найшвидший синтезатор
"""

import os
import time
from pathlib import Path


def test_piper_installation():
    """Перевірка встановлення Piper"""
    try:
        import piper

        print("✅ Piper TTS встановлено")
        return True
    except ImportError:
        print("❌ Piper TTS не встановлено")
        print("Встановіть: pip install piper-tts")
        return False


def download_ukrainian_model():
    """Завантажити українську модель Piper"""
    model_dir = Path("models/piper")
    model_dir.mkdir(parents=True, exist_ok=True)

    model_url = "https://huggingface.co/rhasspy/piper-voices/resolve/main/uk/uk_UA/ukrainian/medium/uk_UA-ukrainian-medium.onnx"
    config_url = "https://huggingface.co/rhasspy/piper-voices/resolve/main/uk/uk_UA/ukrainian/medium/uk_UA-ukrainian-medium.onnx.json"

    model_path = model_dir / "uk_UA-ukrainian-medium.onnx"
    config_path = model_dir / "uk_UA-ukrainian-medium.onnx.json"

    if model_path.exists() and config_path.exists():
        print("✅ Українська модель вже завантажена")
        return str(model_path)

    print("⬇️  Завантаження української моделі Piper...")
    try:
        import requests

        # Завантажити модель
        print(f"Завантаження {model_url}...")
        response = requests.get(model_url, stream=True)
        total_size = int(response.headers.get("content-length", 0))

        with open(model_path, "wb") as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    progress = (downloaded / total_size) * 100
                    print(f"\rПрогрес: {progress:.1f}%", end="")

        print("\n✅ Модель завантажена")

        # Завантажити конфіг
        print(f"Завантаження {config_url}...")
        response = requests.get(config_url)
        with open(config_path, "w") as f:
            f.write(response.text)

        print("✅ Конфіг завантажений")
        return str(model_path)

    except Exception as e:
        print(f"❌ Помилка завантаження: {e}")
        return None


def test_piper_synthesis():
    """Тест синтезу з Piper"""
    print("\n" + "=" * 60)
    print("🔊 ТЕСТ PIPER TTS СИНТЕЗУ")
    print("=" * 60 + "\n")

    try:
        import wave

        import numpy as np
        from piper import PiperVoice

        # Завантажити модель
        model_path = download_ukrainian_model()
        if not model_path:
            return False

        print(f"📂 Модель: {model_path}")

        # Ініціалізація
        print("⚙️  Ініціалізація Piper Voice...")
        start_time = time.time()
        voice = PiperVoice.load(model_path)
        init_time = time.time() - start_time
        print(f"✅ Ініціалізовано за {init_time:.3f}s")

        # Тестові фрази
        test_phrases = [
            "Привіт! Я голосовий асистент Predator Nexus.",
            "Система готова до роботи. Всі агенти активні.",
            "Аналіз даних завершено успішно.",
        ]

        output_dir = Path("test_audio/piper")
        output_dir.mkdir(parents=True, exist_ok=True)

        total_chars = 0
        total_time = 0

        for i, text in enumerate(test_phrases, 1):
            print(f"\n📝 Фраза {i}: {text}")
            print(f"   Символів: {len(text)}")

            # Синтез
            start_time = time.time()
            audio_data = voice.synthesize(text)
            synth_time = time.time() - start_time

            # Статистика
            total_chars += len(text)
            total_time += synth_time

            # Real-time factor
            audio_duration = len(audio_data[0]) / voice.config.sample_rate
            rt_factor = audio_duration / synth_time

            print(f"   ⚡ Синтез: {synth_time:.3f}s")
            print(f"   🎵 Тривалість аудіо: {audio_duration:.2f}s")
            print(f"   🚀 Real-time factor: {rt_factor:.1f}x")

            # Зберегти аудіо
            output_file = output_dir / f"test_{i}.wav"
            with wave.open(str(output_file), "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)  # 16-bit
                wf.setframerate(voice.config.sample_rate)
                wf.writeframes(audio_data[0])

            print(f"   💾 Збережено: {output_file}")

        # Підсумок
        print("\n" + "=" * 60)
        print("📊 ПІДСУМОК ТЕСТУВАННЯ")
        print("=" * 60)
        print(f"Всього фраз: {len(test_phrases)}")
        print(f"Всього символів: {total_chars}")
        print(f"Загальний час: {total_time:.3f}s")
        print(f"Середня швидкість: {total_chars/total_time:.1f} символів/с")
        print(f"Середній RT factor: {(total_chars/total_time)/10:.1f}x")
        print(f"\n💾 Аудіо файли збережено в: {output_dir}")

        return True

    except Exception as e:
        print(f"❌ Помилка тесту: {e}")
        import traceback

        traceback.print_exc()
        return False


def compare_with_coqui():
    """Порівняння Piper vs Coqui"""
    print("\n" + "=" * 60)
    print("⚔️  ПОРІВНЯННЯ: Piper vs Coqui TTS")
    print("=" * 60 + "\n")

    test_text = "Система аналітики готова до роботи."

    # Тест Piper
    try:
        from piper import PiperVoice

        model_path = download_ukrainian_model()
        if model_path:
            voice = PiperVoice.load(model_path)

            start = time.time()
            audio = voice.synthesize(test_text)
            piper_time = time.time() - start

            print(f"⚡ Piper TTS: {piper_time:.3f}s")
    except Exception as e:
        print(f"❌ Piper недоступний: {e}")
        piper_time = None

    # Тест Coqui (якщо встановлено)
    try:
        from TTS.api import TTS

        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

        start = time.time()
        tts.tts_to_file(text=test_text, file_path="test_audio/coqui_test.wav", language="uk")
        coqui_time = time.time() - start

        print(f"🐌 Coqui TTS: {coqui_time:.3f}s")
    except Exception as e:
        print(f"⚠️  Coqui недоступний (це нормально): {e}")
        coqui_time = None

    # Порівняння
    if piper_time and coqui_time:
        speedup = coqui_time / piper_time
        print(f"\n🚀 Piper швидше в {speedup:.1f} разів!")

    return piper_time, coqui_time


if __name__ == "__main__":
    print("\n🔥 PIPER TTS - Найшвидший Синтезатор")
    print("=" * 60 + "\n")

    # Перевірка встановлення
    if not test_piper_installation():
        print("\n💡 Встановіть Piper:")
        print("   pip install piper-tts")
        exit(1)

    # Основний тест
    success = test_piper_synthesis()

    # Порівняння
    if success:
        compare_with_coqui()

    print("\n✅ Тестування завершено!")
    print("=" * 60)
