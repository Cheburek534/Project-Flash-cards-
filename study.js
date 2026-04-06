// —— modules/study.js ————————————————————————————————————————————
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
 