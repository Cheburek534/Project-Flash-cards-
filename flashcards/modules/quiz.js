import { StorageModule } from './storage.js';

export class QuizModule {
    constructor(state, voice) {
        this.state = state;
        this.voice = voice;
        this.qs = [];
        this.idx = 0;
        this.score = 0;
        this.timer = null;
        this.left = 15;
        this.limit = 15;
        this.mode = 'standard'; 
    }

    start(deckId, count = 10, mode = 'standard') {
        this.mode = mode;
        const all = this.state.cards.filter(c => c.deckId === deckId);
        if (!all.length) { alert('В колоді немає карток!'); return; }

        this.qs = all.sort(() => Math.random() - 0.5)
            .slice(0, Math.min(count, all.length))
            .map(c => this._makeQuestion(c));

        this.idx = 0;
        this.score = 0;

        showPage('quiz'); 
        document.getElementById('quiz-result').classList.add('hidden');
        this._showQ();
    }

    _end() {
        clearInterval(this.timer);
        const max = this.qs.length * 20;
        const pct = max > 0 ? Math.round(this.score / max * 100) : 0;

        document.getElementById('quiz-options').innerHTML = '';
        document.getElementById('quiz-question').textContent = '';
        document.getElementById('quiz-final-score').textContent = this.score + ' / ' + max;
        document.getElementById('quiz-final-pct').textContent = pct + '%';

        if (window.AchievementsModule) window.AchievementsModule.check(this.state);
        StorageModule.save(this.state);

        document.getElementById('quiz-result').classList.remove('hidden');
    }
}