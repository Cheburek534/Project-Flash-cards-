import { StorageModule } from './storage.js';

class SimpleQueue {
    constructor() { this.items = []; }
    add(card, isHard) { isHard ? this.items.unshift(card) : this.items.push(card); }
    get() { return this.items.shift(); }
    isEmpty() { return this.items.length === 0; }
}

function* endlessGenerator(array) {
    let i = 0;
    while (true) {
        yield array[i];
        i = (i + 1) % array.length;
    }
}

function runWithTimeout(iterator, seconds, onNext, onTimeout) {
    const endTime = Date.now() + (seconds * 1000);
    function step() {
        if (Date.now() >= endTime) return onTimeout();
        onNext(iterator.next().value, step); 
    }
    step();
}

export class StudyModule {
    constructor(state, emitter = null) {
        this.state = state; this.emitter = emitter;
        this.cards = []; this.index = 0; this.flipped = false;
        this.correct = 0; this.shown = 0; this.isBlitz = false;
    }

    start(deckId) {
        this.isBlitz = false;
        this.cards = this.state.cards.filter(c => c.deckId === deckId).sort(() => Math.random() - 0.5);
        if (!this.cards.length) return alert('Колода порожня!');
        this._initSession();
        window.showPage('study');
        this.showCard();
    }

    startBlitz(deckId) {
        this.isBlitz = true;
        const cards = this.state.cards.filter(c => c.deckId === deckId);
        if (!cards.length) return alert('Колода порожня!');

        const queue = new SimpleQueue();
        cards.forEach(c => {
            const isHard = c.stats && c.stats.wrong > 0;
            queue.add(c, isHard);
        });

        this.cards = [];
        while(!queue.isEmpty()) this.cards.push(queue.get());

        const generator = endlessGenerator(this.cards);

        alert('⚡ Бліц! У тебе 30 секунд.');
        this._initSession();
        window.showPage('study');

        runWithTimeout(generator, 30, (card, nextStep) => {
            this.currentBlitzCard = card;
            this.nextBlitzStep = nextStep;
            this._renderCardUI(card);
            document.getElementById('card-counter').textContent = '⚡ БЛІЦ';
        }, () => {
            alert('⏳ Час вийшов!');
            if (this.emitter) this.emitter.emit('sessionDone', this.state);
        });
    }

    _initSession() {
        this.index = 0; this.flipped = false; this.correct = 0; this.shown = 0;
        this.state.session = { correct: 0, wrong: 0, timePerCard: [] };
    }

    showCard() {
        const card = this.cards[this.index];
        if (!card) { this.finish(); return; }
        this._renderCardUI(card);
        document.getElementById('card-counter').textContent = (this.index + 1) + ' / ' + this.cards.length;
        const fill = document.getElementById('progress-fill');
        if (fill) fill.style.width = (this.index / this.cards.length * 100) + '%';
    }

    _renderCardUI(card) {
        document.getElementById('card-front').textContent = card.front;
        document.getElementById('card-back').textContent = card.back;
        document.getElementById('flashcard').classList.remove('flipped');
        document.getElementById('rating-buttons').classList.add('hidden');
        this.flipped = false;
        this.cardStart = Date.now();
    }

    currentCard() { return this.isBlitz ? this.currentBlitzCard : this.cards[this.index]; }

    flip() {
        if (!this.flipped) {
            this.state.session.timePerCard.push((Date.now() - this.cardStart) / 1000);
            this.shown++;
        }
        document.getElementById('flashcard').classList.toggle('flipped');
        this.flipped = !this.flipped;
        if (this.flipped) document.getElementById('rating-buttons').classList.remove('hidden');
    }

    rate(result) {
        const card = this.currentCard();
        if (!card) return;
        card.stats = card.stats || { seen: 0, right: 0, wrong: 0 };
        card.stats.seen++;

        if (result === 'ok') { this.correct++; this.state.session.correct++; card.stats.right++; }
        else { this.state.session.wrong++; card.stats.wrong++; }

        if (this.isBlitz) this.nextBlitzStep();
        else { this.index++; this.showCard(); }
    }

    finish() {
        this.state.progress.total += this.shown;
        this.state.progress.correct += this.correct;
        StorageModule.save(this.state);
        if (this.emitter) this.emitter.emit('sessionDone', this.state);
    }
}
