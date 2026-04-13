import { StorageModule }       from './modules/storage.js';
import { ThemeModule }         from './modules/themes.js';
import { StudyModule }         from './modules/study.js';
import { ReflectionModule }    from './modules/reflection.js';
import { VoiceModule }         from './modules/voice.js';
import { QuizModule }          from './modules/quiz.js';
import { CardsModule }         from './modules/cards.js';
import { VanishModule }        from './modules/vanish.js';
import { AchievementsModule }  from './modules/achievements.js';

const state = StorageModule.load();

const hasDefaults = state.decks.some(d => !d.custom);
if (!hasDefaults) await loadDefaultDecks();
await AchievementsModule.load();

ThemeModule.apply(state.settings.theme, state.settings.cardStyle);

window.voice              = new VoiceModule();
window.state              = state;
window.showPage           = showPage;
window.StorageModule      = StorageModule;
window.ThemeModule        = ThemeModule;
window.StudyModule        = new StudyModule(state);
window.QuizModule         = new QuizModule(state, window.voice);
window.CardsModule        = CardsModule;
window.VanishModule       = new VanishModule(state);
window.AchievementsModule = AchievementsModule;
window.ReflectionModule   = ReflectionModule;

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

    if (window.voice.matches(text, currentCard.back)) {
      window.StudyModule.rate('ok');
    }
  });
};

function showPage(name) {
  document.querySelectorAll('.page').forEach(s => s.classList.add('hidden'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.remove('hidden');
  
  if (name === 'stats')         ReflectionModule.render(state);
  if (name === 'decks')         CardsModule.renderDecks(state);
  if (name === 'achievements')  AchievementsModule.renderAll(state);
  if (name === 'settings')      ThemeModule.renderPickers();
  if (name === 'home') {
      const streakEl = document.getElementById('home-streak');
      if (streakEl) streakEl.textContent = state.progress.streak;
  }
}

export const CardsModule = {
  openModal() { 
      document.getElementById('modal').classList.remove('hidden'); 
  },
  
  createDeck(state) {
    const name = document.getElementById('f-name').value;
    if (!name) return alert('Назва обов’язкова!');
    const deck = {
      id: 'deck-' + Date.now(),
      name,
      desc: document.getElementById('f-desc').value,
      icon: document.getElementById('f-icon').value || '📚',
      color: document.getElementById('f-color').value,
      custom: true,
      count: 0
    };
    state.decks.push(deck);
    StorageModule.save(state);
    this.renderDecks(state);
    document.getElementById('modal').classList.add('hidden');
  },
  
  renderDecks(state) {
    const grid = document.getElementById('decks-grid');
    if (!grid) return;
    grid.innerHTML = '';
    state.decks.forEach(d => {
      const div = document.createElement('div');
      div.className = 'deck-card';
      div.style.borderTop = `4px solid ${d.color}`;
      div.innerHTML = `
        <div style='font-size:2rem'>${d.icon}</div>
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        <p style="font-size:0.8rem; opacity:0.7">Карток: ${d.count || 0}</p>
        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
          <button onclick="StudyModule.start('${d.id}')">Вчити</button>
          <button class='secondary' onclick="QuizModule.start('${d.id}')">Тест</button>
        </div>`;
      grid.appendChild(div);
    });
  }
};

async function loadDefaultDecks() {
  const files = [
    './data/deck-javascript.json',
    './data/deck-english.json',
  ];
  for (const file of files) {
    try {
      const data = await fetch(file).then(r => r.json());
      state.decks.push(data.deck);
      state.cards.push(...data.cards);
      state.decks[state.decks.length-1].count = data.cards.length;
    } catch(e) {
      console.warn('Не вдалось завантажити', file, ':', e.message);
    }
  }
  StorageModule.save(state);
}

showPage('home');
const streakEl = document.getElementById('home-streak');
if (streakEl) streakEl.textContent = state.progress.streak;
CardsModule.renderDecks(state);
ThemeModule.renderPickers();