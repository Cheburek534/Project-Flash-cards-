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

_makeQuestion(card) {
        const wrong = this.state.cards
            .filter(c => c.id !== card.id && c.back !== card.back)
            .sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.back);
        while (wrong.length < 3) wrong.push('- невідомо -');
        const opts = [...wrong, card.back].sort(() => Math.random() - 0.5);
        return { q: card.front, answer: card.back, opts };
    }

    _showQ() {
        const q = this.qs[this.idx];
        if (!q) { this._end(); return; }

        document.getElementById('quiz-question').textContent = q.q;
        document.getElementById('quiz-counter').textContent = (this.idx+1) + ' / ' + this.qs.length;
        document.getElementById('quiz-score').textContent = this.score + ' балів';

        const box = document.getElementById('quiz-options');
        box.innerHTML = '';

        q.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'opt secondary';
            btn.textContent = ['A','B','C','D'][i] + '. ' + opt;

            btn.onclick = () => {
                if (!btn.disabled) this.answer(opt);
            };
            box.appendChild(btn);
        });

        ['voice-quiz-preview'].forEach(id => {
            const el = document.getElementById(id); if(el) el.textContent='';
        });

        if (this.mode === 'blitz') {
            this._startTimer();
            const timerEl = document.getElementById('quiz-timer');
            if(timerEl) timerEl.parentElement.style.display = 'block';
        } else {
            clearInterval(this.timer);
            const timerEl = document.getElementById('quiz-timer');
            if(timerEl) timerEl.parentElement.style.display = 'none';
        }
    }

_startTimer() {
        this.left = this.limit;
        this._updateTimer();
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.left--;
            this._updateTimer();
            if (this.left <= 0) {
                clearInterval(this.timer);
                this.answer(null);
            }
        }, 1000);
    }

    _updateTimer() {
        const el = document.getElementById('quiz-timer');
        const fill = document.getElementById('timer-fill');
        if (el) {
            el.textContent = '⏱ ' + this.left + 'c';
            el.classList.toggle('urgent', this.left <= 5);
        }
        if (fill) fill.style.width = (this.left/this.limit*100)+'%';
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