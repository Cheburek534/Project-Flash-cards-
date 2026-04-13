
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

const voice = new VoiceModule();
window.state              = state;
window.showPage           = showPage;
window.StorageModule      = StorageModule;
window.ThemeModule        = ThemeModule;
window.StudyModule        = new StudyModule(state);
window.QuizModule         = new QuizModule(state, voice);
window.CardsModule        = CardsModule;
window.VanishModule       = new VanishModule(state);
window.AchievementsModule = AchievementsModule;
window.ReflectionModule   = ReflectionModule;
window.listenForStudy     = listenForStudy;

showPage('home');
document.getElementById('home-streak').textContent = state.progress.streak;
CardsModule.renderDecks(state);
ThemeModule.renderPickers();


function showPage(name) {
  document.querySelectorAll('.page').forEach(s => s.classList.add('hidden'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.remove('hidden');
  if (name === 'stats')         ReflectionModule.render(state);
  if (name === 'decks')         CardsModule.renderDecks(state);
  if (name === 'achievements')  AchievementsModule.renderAll(state);
  if (name === 'settings')      ThemeModule.renderPickers();
  if (name === 'home')          document.getElementById('home-streak').textContent = state.progress.streak;
}

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

function listenForStudy() {
  if (!voice.ok) { alert('Chrome не підтримує голос'); return; }
  const card = window.StudyModule.currentCard();
  if (!card) return;
  voice.listen(text => {
    state.progress.voiceCount = (state.progress.voiceCount || 0) + 1;
    const ok = voice.matches(text, card.back);
    window.StudyModule.rate(ok ? 'ok' : 'fail');
  });
}