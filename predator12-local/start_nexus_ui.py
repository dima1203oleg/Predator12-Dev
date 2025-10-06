#!/usr/bin/env python3
"""
Nexus Core UI Launcher - запуск веб-інтерфейсу Predator Analytics
"""

import subprocess
import time
import webbrowser
import os
import sys
import signal
import json
from pathlib import Path

def check_port_available(port=5173):
    """Перевіряє чи вільний порт"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        result = sock.connect_ex(('localhost', port))
        return result != 0

def start_vite_dev_server():
    """Запускає Vite dev сервер"""
    frontend_dir = Path(__file__).parent / 'frontend'
    
    if not frontend_dir.exists():
        print("❌ Frontend директорія не знайдена!")
        return None
    
    print("🚀 Запускаю Vite dev сервер...")
    
    try:
        # Запускаємо npm run dev
        process = subprocess.Popen(
            ['npm', 'run', 'dev'],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Даємо час серверу запуститися
        time.sleep(3)
        
        return process
    except Exception as e:
        print(f"❌ Помилка запуску Vite: {e}")
        return None

def start_static_server():
    """Запускає статичний сервер як резерв"""
    frontend_dir = Path(__file__).parent / 'frontend'
    dist_dir = frontend_dir / 'dist'
    
    if dist_dir.exists():
        print("📁 Запускаю статичний сервер з dist...")
        try:
            process = subprocess.Popen(
                [sys.executable, '-m', 'http.server', '8080'],
                cwd=dist_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            time.sleep(2)
            return process, 8080
        except Exception as e:
            print(f"❌ Помилка запуску статичного сервера: {e}")
    
    return None, None

def open_browser(url="http://localhost:5173"):
    """Відкриває браузер"""
    print(f"🌐 Відкриваю браузер: {url}")
    try:
        webbrowser.open(url)
        return True
    except Exception as e:
        print(f"❌ Помилка відкриття браузера: {e}")
        return False

def main():
    print("🎯 Predator Analytics Nexus Core v1.0 - Launcher")
    print("=" * 50)
    
    # Перевіряємо порт
    if not check_port_available(5173):
        print("⚠️ Порт 5173 зайнятий, спробую альтернативи...")
    
    # Запускаємо сервер
    vite_process = start_vite_dev_server()
    
    if vite_process:
        print("✅ Vite dev сервер запущено!")
        
        # Чекаємо запуску
        time.sleep(5)
        
        # Відкриваємо браузер
        if open_browser("http://localhost:5173"):
            print("\n🎉 Nexus Core інтерфейс запущено!")
            print("📱 URL: http://localhost:5173")
            print("\n💡 Можливості інтерфейсу:")
            print("   • 🤖 48 безкоштовних AI моделей")
            print("   • 🧠 MAS агент система")  
            print("   • 🎯 3D інтерактивний гід")
            print("   • 📊 Розширена аналітика")
            print("   • 🔄 Система самовдосконалення")
            print("   • 🌍 i18n підтримка (UA/EN)")
            
            print("\n⌨️ Натисніть Ctrl+C для зупинки...")
            
            try:
                # Тримаємо процес живим
                vite_process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Зупиняю сервер...")
                vite_process.terminate()
                vite_process.wait()
                print("✅ Сервер зупинено!")
        
    else:
        print("⚠️ Спробую статичний сервер...")
        static_process, port = start_static_server()
        
        if static_process and port:
            url = f"http://localhost:{port}"
            print(f"✅ Статичний сервер запущено на порту {port}")
            
            if open_browser(url):
                print(f"\n🎉 Nexus Core (статична версія) запущено!")
                print(f"📱 URL: {url}")
                
                try:
                    static_process.wait()
                except KeyboardInterrupt:
                    print("\n🛑 Зупиняю сервер...")
                    static_process.terminate()
                    static_process.wait()
        else:
            print("❌ Не вдалося запустити жоден сервер")
            print("💡 Спробуйте запустити вручну:")
            print("   cd frontend && npm run dev")

if __name__ == "__main__":
    main()
