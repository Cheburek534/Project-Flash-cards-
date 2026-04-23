import { StorageModule }        from './modules/storage.js';
import { ThemeModule }          from './modules/themes.js';
import { StudyModule }          from './modules/study.js';
import { ReflectionModule }     from './modules/reflection.js';
import { VoiceModule }          from './modules/voice.js';
import { QuizModule }           from './modules/quiz.js';
import { VanishModule }         from './modules/vanish.js';
import { AchievementsModule }   from './modules/achievements.js';
import { CardsModule }          from './modules/cards.js';

const emitter = {
  events: {},
  on(event, fn) { (this.events[event] = this.events[event] || []).push(fn); },
  emit(event, data) { (this.events[event] || []).forEach(fn => fn(data)); }
};

const state = StorageModule.load();
const voice = new VoiceModule();

window.state            = state;
window.voice            = voice;
window.showPage         = showPage;
window.StorageModule    = StorageModule;
window.ThemeModule      = ThemeModule;
window.StudyModule      = new StudyModule(state, emitter);
window.QuizModule       = new QuizModule(state, voice);
window.CardsModule      = CardsModule;
window.VanishModule     = new VanishModule(state);
window.AchievementsModule = AchievementsModule;
window.ReflectionModule = ReflectionModule;

emitter.on('sessionDone', (currentState) => {
  ReflectionModule.showAfterSession(currentState);
  AchievementsModule.check(currentState);
  showPage('results');
});

window.listenForStudy = function() {
  if (!window.voice || !window.voice.ok) return alert("Голос не підтримується.");
  window.voice.listen((text) => {
    const preview = document.getElementById('voice-preview');
    if (preview) preview.textContent = text;
    const currentCard = window.StudyModule.currentCard();
    if (!currentCard) return;

    state.progress.voiceCount = (state.progress.voiceCount || 0) + 1;
    const lowerText = text.toLowerCase();

    if (['знав', 'знаю', 'правильно', 'вірно', 'так'].some(p => lowerText.includes(p))) {
      window.StudyModule.rate('ok'); return;
    }
    if (['не знав', 'не знаю', 'невідомо', 'пропустити'].some(p => lowerText.includes(p))) {
      window.StudyModule.rate('fail'); return;
    }
    if (window.voice.matches(text, currentCard.back)) window.StudyModule.rate('ok');
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

async function loadDefaultDecks() {
  const files = ['./data/deck-javascript.json', './data/deck-english.json'];
  for (const file of files) {
    try {
      const data = await fetch(file).then(r => r.json());
      state.decks.push(data.deck);
      state.cards.push(...data.cards);
      state.decks[state.decks.length-1].count = data.cards.length;
    } catch(e) { console.warn('Помилка:', file); }
  }
  StorageModule.save(state);
}

const init = async () => {
  const hasDefaults = state.decks.some(d => !d.custom);
  if (!hasDefaults) await loadDefaultDecks();
  await AchievementsModule.load();
  ThemeModule.apply(state.settings.theme, state.settings.cardStyle);

  showPage('home');
  CardsModule.renderDecks(state);
};

init();