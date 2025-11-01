#!/usr/bin/env python3
"""
⚡ Тест Whisper Large v3 Turbo - Найшвидше розпізнавання
"""

import time
import os
from pathlib import Path

def test_whisper_installation():
    """Перевірка встановлення Whisper"""
    try:
        import whisper
        print("✅ Whisper встановлено")
        print(f"   Версія: {whisper.__version__ if hasattr(whisper, '__version__') else 'unknown'}")
        return True
    except ImportError:
        print("❌ Whisper не встановлено")
        print("Встановіть: pip install openai-whisper")
        return False

def test_whisper_turbo():
    """Тест Whisper Large v3 Turbo"""
    print("\n" + "="*60)
    print("⚡ ТЕСТ WHISPER LARGE V3 TURBO")
    print("="*60 + "\n")

    try:
        import whisper

        # Завантажити модель
        print("📥 Завантаження моделі large-v3-turbo...")
        start_time = time.time()
        model = whisper.load_model("turbo")  # large-v3-turbo
        load_time = time.time() - start_time
        print(f"✅ Модель завантажена за {load_time:.2f}s")

        # Перевірити тестові аудіо
        test_audio_dir = Path("test_audio")
        if not test_audio_dir.exists():
            print("⚠️  Тестові аудіо не знайдені")
            print("Спочатку запустіть test_voice_system.py для генерації аудіо")
            return False

        audio_files = list(test_audio_dir.glob("test_*.wav"))
        if not audio_files:
            print("⚠️  Аудіо файли не знайдені в test_audio/")
            return False

        print(f"\n📂 Знайдено {len(audio_files)} тестових файлів\n")

        total_duration = 0
        total_time = 0

        for audio_file in audio_files[:3]:  # Тестуємо перші 3
            print(f"🎵 Файл: {audio_file.name}")

            # Розпізнавання
            start = time.time()
            result = model.transcribe(
                str(audio_file),
                language="uk",
                fp16=False  # CPU-friendly
            )
            transcribe_time = time.time() - start

            # Статистика
            audio_duration = result.get("duration", 0)
            rt_factor = audio_duration / transcribe_time if transcribe_time > 0 else 0

            total_duration += audio_duration
            total_time += transcribe_time

            # Результат
            print(f"   📝 Текст: {result['text'][:80]}...")
            print(f"   ⏱️  Тривалість аудіо: {audio_duration:.2f}s")
            print(f"   ⚡ Час розпізнавання: {transcribe_time:.3f}s")
            print(f"   🚀 RT factor: {rt_factor:.1f}x")
            print()

        # Підсумок
        print("="*60)
        print("📊 ПІДСУМОК")
        print("="*60)
        print(f"Загальна тривалість: {total_duration:.2f}s")
        print(f"Загальний час: {total_time:.3f}s")
        avg_rt = total_duration / total_time if total_time > 0 else 0
        print(f"Середній RT factor: {avg_rt:.1f}x")

        return True

    except Exception as e:
        print(f"❌ Помилка: {e}")
        import traceback
        traceback.print_exc()
        return False

def compare_whisper_models():
    """Порівняння різних моделей Whisper"""
    print("\n" + "="*60)
    print("⚔️  ПОРІВНЯННЯ WHISPER МОДЕЛЕЙ")
    print("="*60 + "\n")

    try:
        import whisper

        # Тестовий файл
        test_audio_dir = Path("test_audio")
        audio_files = list(test_audio_dir.glob("test_*.wav"))
        if not audio_files:
            print("⚠️  Тестові аудіо не знайдені")
            return

        test_file = audio_files[0]
        print(f"📂 Тестовий файл: {test_file.name}\n")

        models = ["tiny", "base", "small", "turbo"]
        results = {}

        for model_name in models:
            try:
                print(f"🔄 Тестування моделі: {model_name}")

                # Завантажити модель
                start = time.time()
                model = whisper.load_model(model_name)
                load_time = time.time() - start

                # Розпізнати
                start = time.time()
                result = model.transcribe(str(test_file), language="uk", fp16=False)
                transcribe_time = time.time() - start

                results[model_name] = {
                    "load_time": load_time,
                    "transcribe_time": transcribe_time,
                    "text": result["text"],
                    "rt_factor": result.get("duration", 0) / transcribe_time
                }

                print(f"   ⏱️  Завантаження: {load_time:.2f}s")
                print(f"   ⚡ Розпізнавання: {transcribe_time:.3f}s")
                print(f"   🚀 RT factor: {results[model_name]['rt_factor']:.1f}x")
                print()

            except Exception as e:
                print(f"   ❌ Помилка: {e}\n")

        # Підсумок
        if results:
            print("="*60)
            print("📊 ПОРІВНЯЛЬНА ТАБЛИЦЯ")
            print("="*60)
            print(f"{'Модель':<10} {'Завант.':<12} {'Розпізн.':<12} {'RT Factor':<12}")
            print("-"*60)
            for name, data in results.items():
                print(f"{name:<10} {data['load_time']:.2f}s{'':<6} {data['transcribe_time']:.3f}s{'':<6} {data['rt_factor']:.1f}x")

            # Найкраща модель
            fastest = min(results.items(), key=lambda x: x[1]['transcribe_time'])
            print(f"\n🏆 Найшвидша: {fastest[0]} ({fastest[1]['transcribe_time']:.3f}s)")

    except Exception as e:
        print(f"❌ Помилка: {e}")

def test_faster_whisper():
    """Тест faster-whisper"""
    print("\n" + "="*60)
    print("🚀 ТЕСТ faster-whisper")
    print("="*60 + "\n")

    try:
        from faster_whisper import WhisperModel

        print("📥 Завантаження faster-whisper моделі...")
        start = time.time()
        model = WhisperModel("base", device="cpu", compute_type="int8")
        load_time = time.time() - start
        print(f"✅ Модель завантажена за {load_time:.2f}s")

        # Тестові аудіо
        test_audio_dir = Path("test_audio")
        audio_files = list(test_audio_dir.glob("test_*.wav"))
        if not audio_files:
            print("⚠️  Тестові аудіо не знайдені")
            return False

        test_file = audio_files[0]
        print(f"\n🎵 Файл: {test_file.name}")

        # Розпізнавання
        start = time.time()
        segments, info = model.transcribe(str(test_file), language="uk")

        # Зібрати текст
        text = " ".join([segment.text for segment in segments])
        transcribe_time = time.time() - start

        print(f"   📝 Текст: {text[:80]}...")
        print(f"   ⏱️  Тривалість: {info.duration:.2f}s")
        print(f"   ⚡ Час: {transcribe_time:.3f}s")
        print(f"   🚀 RT factor: {info.duration/transcribe_time:.1f}x")

        return True

    except ImportError:
        print("⚠️  faster-whisper не встановлено")
        print("Встановіть: pip install faster-whisper")
        return False
    except Exception as e:
        print(f"❌ Помилка: {e}")
        return False

def benchmark_all():
    """Benchmark всіх рішень"""
    print("\n" + "="*60)
    print("🏁 ФІНАЛЬНИЙ BENCHMARK")
    print("="*60 + "\n")

    # Перевірити тестові файли
    test_audio_dir = Path("test_audio")
    audio_files = list(test_audio_dir.glob("test_*.wav"))
    if not audio_files:
        print("⚠️  Спочатку згенеруйте тестові аудіо:")
        print("   python test_voice_system.py")
        return

    test_file = audio_files[0]
    results = {}

    # 1. Whisper Turbo
    try:
        import whisper
        model = whisper.load_model("turbo")
        start = time.time()
        result = model.transcribe(str(test_file), language="uk", fp16=False)
        results["Whisper Turbo"] = time.time() - start
    except:
        pass

    # 2. faster-whisper
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel("base", device="cpu", compute_type="int8")
        start = time.time()
        segments, info = model.transcribe(str(test_file), language="uk")
        _ = list(segments)  # Consume generator
        results["faster-whisper"] = time.time() - start
    except:
        pass

    # Підсумок
    if results:
        print("📊 РЕЗУЛЬТАТИ:")
        print("-"*60)
        for name, time_val in sorted(results.items(), key=lambda x: x[1]):
            print(f"{name:<20} {time_val:.3f}s")

        fastest = min(results.items(), key=lambda x: x[1])
        print(f"\n🏆 Переможець: {fastest[0]} ({fastest[1]:.3f}s)")

if __name__ == "__main__":
    print("\n⚡ WHISPER TURBO BENCHMARK")
    print("="*60 + "\n")

    # Перевірка
    if not test_whisper_installation():
        print("\n💡 Встановіть Whisper:")
        print("   pip install openai-whisper")
        exit(1)

    # Тести
    test_whisper_turbo()
    compare_whisper_models()
    test_faster_whisper()
    benchmark_all()

    print("\n✅ Benchmark завершено!")
    print("="*60)
