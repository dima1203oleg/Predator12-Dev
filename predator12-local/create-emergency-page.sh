#!/bin/bash

# Створюємо простий тестовий файл
echo '<!DOCTYPE html>
<html>
<head>
<title>TEST</title>
<style>
body { background: white; color: black; font-size: 20px; padding: 20px; }
</style>
</head>
<body>
<h1>FRONTEND TEST</h1>
<p>Якщо ви бачите це - все працює!</p>
</body>
</html>' > /Users/dima/Documents/Predator12/predator12-local/frontend/dist/index.html

# Інформація
echo "Emergency test page created!"
echo "Now rebuild Docker container manually"
