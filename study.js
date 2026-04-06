
import { StorageModule } from './storage.js';

export class StudyModule {
  constructor(state) {
    this.state      = state;
    this.cards      = [];
    this.index      = 0;
    this.flipped    = false;
    this.correct    = 0;
    this.shown      = 0;
    this.cardStart  = null;
  }

  start(deckId) {
    this.cards = this.state.cards
      .filter(c => c.deckId === deckId)
      .sort(() => Math.random() - 0.5);
    if (!this.cards.length) { alert('В цій колоді немає карток!'); return; }
    this.index   = 0; this.flipped = false;
    this.correct = 0; this.shown   = 0;
    this.state.session = { correct:0, wrong:0, timePerCard:[] };
    showPage('study');
    this.showCard();
  }

  showCard() {
    const card = this.cards[this.index];
    if (!card) { this.finish(); return; }
    document.getElementById('card-front').textContent    = card.front;
    document.getElementById('card-back').textContent     = card.back;
    document.getElementById('card-example').textContent  = card.example || '';
    document.getElementById('card-hint').textContent     = card.hint ? '💡 ' + card.hint : '';
    
    document.getElementById('card-counter').textContent  =
      (this.index + 1) + ' / ' + this.cards.length;
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = (this.index / this.cards.length * 100) + '%';
    
    document.getElementById('flashcard').classList.remove('flipped');
    document.getElementById('rating-buttons').classList.add('hidden');
    document.getElementById('voice-study-area').classList.add('hidden');
    document.getElementById('voice-preview').textContent = '';
    
    this.flipped = false;
    this.cardStart = Date.now();
  }

  currentCard() { return this.cards[this.index] || null; }

  flip() {
    if (!this.flipped) {
      const t = (Date.now() - this.cardStart) / 1000;
      this.state.session.timePerCard.push(t);
      this.shown++;
    }
    document.getElementById('flashcard').classList.toggle('flipped');
    this.flipped = !this.flipped;
    if (this.flipped) {
      document.getElementById('rating-buttons').classList.remove('hidden');
      document.getElementById('voice-study-area').classList.remove('hidden');
    }
  }

  rate(result) {
    const card = this.cards[this.index];
    if (!card) return;
    card.stats.seen++;
    if (result === 'ok') {
      this.correct++; this.state.session.correct++; card.stats.right++;
    } else {
      this.state.session.wrong++; card.stats.wrong++;
    }
    this.index++;
    this.showCard();
  }

  finish() {
    this.state.progress.total   += this.shown;
    this.state.progress.correct += this.correct;
    // Streak
    const today = new Date().toDateString();
    if (this.state.progress.lastDate !== today) {
      const yd = new Date(); yd.setDate(yd.getDate()-1);
      this.state.progress.streak =
        this.state.progress.lastDate === yd.toDateString()
          ? this.state.progress.streak + 1 : 1;
      this.state.progress.lastDate = today;
    }
    const day = new Date().toISOString().slice(0,10);
    this.state.progress.activity[day] =
      (this.state.progress.activity[day] || 0) + this.shown;
    StorageModule.save(this.state);
    
    const pct = this.shown ? Math.round(this.correct/this.shown*100) : 0;
    document.getElementById('result-shown').textContent   = this.shown;
    document.getElementById('result-correct').textContent = this.correct;
    document.getElementById('result-pct').textContent     = pct + '%';
    
    if (window.AchievementsModule) window.AchievementsModule.check(this.state);
    if (window.ReflectionModule)
      window.ReflectionModule.showAfterSession(this.state);
    
    showPage('results');
  }
}

 