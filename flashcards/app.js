import { StorageModule } from './modules/storage.js';
import { ThemeModule } from './modules/themes.js';
import { StudyModule as StudyClass } from './modules/study.js';
import { QuizModule as QuizClass } from './modules/quiz.js';
import { ReflectionModule } from './modules/reflection.js';
import { AchievementsModule } from './modules/achievements.js';
import { VoiceModule } from './modules/voice.js';

// 1. Ініціалізація стану та головних модулів
window.state = StorageModule.load();
window.voice = new VoiceModule();
window.StudyModule = new StudyClass(window.state);
window.QuizModule = new QuizClass(window.state, window.voice);

// ПРИВ'ЯЗКА МОДУЛІВ ДО WINDOW (для роботи onclick в HTML)
window.StorageModule = StorageModule; // ВИПРАВЛЕННЯ ДЛЯ КНОПКИ СКИДАННЯ
window.ReflectionModule = ReflectionModule;
window.ThemeModule = ThemeModule;

// 2. Головна функція для голосової відповіді
window.listenForStudy = function() {
  if (!window.voice || !window.voice.ok) {
    return alert("Голосове розпізнавання не підтримується у цьому браузері.");
  }

  window.voice.listen((text) => {
    console.log("Розпізнано:", text);
    const preview = document.getElementById('voice-preview');
    if (preview) preview.textContent = text;

    const currentCard = window.StudyModule.currentCard();
    if (!currentCard) return;

    const lowerText = text.toLowerCase();

    // Команди "ЗНАВ" / "НЕ ЗНАВ"
    const successPhrases = ['знав', 'знаю', 'правильно', 'вірно', 'так'];
    if (successPhrases.some(phrase => lowerText.includes(phrase))) {
      window.StudyModule.rate('ok');
      return;
    }

    const failurePhrases = ['не знав', 'не знаю', 'невідомо', 'пропустити', 'наступна'];
    if (failurePhrases.some(phrase => lowerText.includes(phrase))) {
      window.StudyModule.rate('fail');
      return;
    }

    // Перевірка по змісту картки
    if (window.voice.matches(text, currentCard.back)) {
      window.StudyModule.rate('ok');
    }
  });
};

// 3. Навігація
window.showPage = function(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.remove('hidden');

  if (pageId === 'stats') ReflectionModule.render(window.state);
  if (pageId === 'achievements') AchievementsModule.renderAll(window.state);
  if (pageId === 'decks') window.CardsModule.renderDecks();
};

// 4. Керування колодами
window.CardsModule = {
  openModal() { document.getElementById('modal').classList.remove('hidden'); },
  createDeck() {
    const name = document.getElementById('f-name').value;
    if (!name) return alert('Назва обов’язкова!');
    const deck = {
      id: 'deck-' + Date.now(),
      name,
      desc: document.getElementById('f-desc').value,
      icon: document.getElementById('f-icon').value || '📚',
      color: document.getElementById('f-color').value,
      custom: true
    };
    window.state.decks.push(deck);
    StorageModule.save(window.state);
    this.renderDecks();
    document.getElementById('modal').classList.add('hidden');
  },
  renderDecks() {
    const grid = document.getElementById('decks-grid');
    if (!grid) return;
    grid.innerHTML = '';
    window.state.decks.forEach(d => {
      const div = document.createElement('div');
      div.className = 'deck-card';
      div.style.borderTop = `4px solid ${d.color}`;
      div.innerHTML = `
        <div style='font-size:2rem'>${d.icon}</div>
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
          <button onclick="StudyModule.start('${d.id}')">Вчити</button>
          <button class='secondary' onclick="QuizModule.start('${d.id}')">Тест</button>
        </div>`;
      grid.appendChild(div);
    });
  }
};

// 5. Запуск
document.addEventListener('DOMContentLoaded', async () => {
  await AchievementsModule.load();
  if (window.state.decks.length === 0) {
    try {
      const enData = await fetch('./data/deck-english.json').then(r => r.json());
      const jsData = await fetch('./data/deck-javascript.json').then(r => r.json());
      window.state.decks = [enData.deck, jsData.deck];
      window.state.cards = [...enData.cards, ...jsData.cards];
      StorageModule.save(window.state);
    } catch (e) { console.error("Error:", e); }
  }
  window.CardsModule.renderDecks();
  const streakEl = document.getElementById('home-streak');
  if (streakEl) streakEl.textContent = window.state.progress.streak;
  ThemeModule.apply(window.state.settings.theme, window.state.settings.cardStyle);
});