# 📱 QR Code Customizer

Веб-приложение для генерации и кастомизации QR-кодов. Позволяет кодировать ссылки и произвольный текст, настраивать цвета кода и фона, изменять размер, скачивать результат в форматах PNG/SVG и просматривать историю последних генераций.

## Стек технологий
- Backend: Python 3.10+, FastAPI, Uvicorn, qrcode, Pillow
- Frontend: React 18, Vite, Tailwind CSS

---

## 🚀 Инструкция по запуску

### 1. Запуск сервера (Backend)
В первом окне терминала:
cd backend
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload --port 8000

- Сервер будет доступен по адресу: http://localhost:8000
- Документация API (Swagger): http://localhost:8000/docs

### 2. Запуск интерфейса (Frontend)
Во втором окне терминала:
cd frontend
npm install
npm run dev

- Откройте в браузере: http://localhost:5173

(Примечание для Windows: если в PowerShell появляется ошибка о запрете выполнения скриптов, выполните команду: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

---

## 📂 Документация проекта
- docs/design.md — Проектирование, пользовательские сценарии, модель данных и API (Часть 1)
- docs/AI_REFLECTION.md — Отчет об опыте использования AI-ассистентов (Часть 3)