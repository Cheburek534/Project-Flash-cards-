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

 