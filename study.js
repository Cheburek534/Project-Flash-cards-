export class StudyModule {
  constructor(state) {
    this.state = state;
    this.cardStart = null;
    this.currentDeck = null;
  }

  start(deckId) {
    this.currentDeck = deckId;
    this.state.session = { correct: 0, wrong: 0, timePerCard: [] };
    this.cardStart = Date.now();
  }

  rate(isCorrect) {
    const elapsed = (Date.now() - this.cardStart) / 1000;
    this.state.session.timePerCard.push(elapsed);
    if (isCorrect) this.state.session.correct += 1;
    else this.state.session.wrong += 1;
    this.cardStart = Date.now();
  }
}

