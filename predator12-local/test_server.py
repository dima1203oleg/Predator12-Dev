#!/usr/bin/env python3
import http.server
import os
import socketserver
import sys

# Перехід до директорії dist
try:
    os.chdir("frontend/dist")
    print("✅ Перейшов до frontend/dist")
except:
    print("❌ Не вдалося знайти frontend/dist. Виконайте npm run build спочатку.")
    sys.exit(1)

PORT = 8080


class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format, *args):
        print(f"🌐 {self.address_string()} - {format % args}")


print(f"🚀 Запуск Predator Nexus на http://localhost:{PORT}")
print(f"📂 Директорія: {os.getcwd()}")
print(f"⏹️  Зупинити: Ctrl+C")
print()

try:
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"✅ Сервер готовий на порту {PORT}")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n🛑 Сервер зупинено")
except Exception as e:
    print(f"❌ Помилка: {e}")
