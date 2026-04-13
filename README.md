# 🗂 FlashCards — Веб-застосунок для вивчення

Курсова робота. JavaScript, 5 студентів.

## Функціонал
- 📖 Флеш-картки з flip-анімацією
- 📝 Тести з таймером і 4 варіантами відповіді
- 🎤 Голосові відповіді (Web Speech API)
- 🫥 Режим зникнення слів
- 🏆 Система досягнень
- 📊 Статистика і теплова карта активності
- 🎨 4 теми (light/dark/ocean/forest) + 4 стилі карток

## Запуск
```bash
# Варіант 1: VS Code + Live Server
# Відкрити папку → правий клік на index.html → Open with Live Server

# Варіант 2: Python
python -m http.server 5500
# відкрити http://localhost:5500
```

## Структура
```text
flashcards/
  index.html        ← єдина HTML-сторінка
  style.css         ← стилі + 4 теми
  app.js            ← головний модуль
  modules/
    storage.js      ← localStorage
    study.js        ← режим навчання
    quiz.js         ← тести
    voice.js        ← Web Speech API
    vanish.js       ← режим зникнення
    reflection.js   ← статистика
    themes.js       ← теми
    cards.js        ← CRUD колод
    achievements.js ← досягнення
  data/
    deck-javascript.json
    deck-english.json
    achievements.json
```

## Команда
- Студент 1 — Team Lead: app.js, storage.js, study.js, reflection.js
- Студент 2 — Frontend UI: index.html, style.css, themes.js
- Студент 3 — Frontend JS: voice.js, quiz.js
- Студент 4 — Backend-lite: cards.js, vanish.js
- Студент 5 — QA/Контент: дані, achievements.js, тестування
