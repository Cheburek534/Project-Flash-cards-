import { StorageModule } from './storage.js';

function memoizeRender(fn) {
    let cacheHTML = '';
    let lastCount = -1;

    return function(state) {
        const currentCount = state.decks.length;
        if (currentCount === lastCount && cacheHTML) {
            document.getElementById('decks-grid').innerHTML = cacheHTML;
            return;
        }
        lastCount = currentCount;
        cacheHTML = fn(state);
        document.getElementById('decks-grid').innerHTML = cacheHTML;
    };
}

export const CardsModule = {
    openModal() { document.getElementById('modal').classList.remove('hidden'); },
    createDeck(state) {
        const name = document.getElementById('f-name').value;
        if (!name) return alert('Назва обов\'язкова!');

        state.decks.push({
            id: 'deck-' + Date.now(),
            name,
            desc: document.getElementById('f-desc').value,
            icon: document.getElementById('f-icon').value || '🗂️',
            color: document.getElementById('f-color').value,
            custom: true, count: 0
        });

        StorageModule.save(state);
        this.renderDecks(state);
        document.getElementById('modal').classList.add('hidden');
    },

    renderDecks: memoizeRender(function(state) {
        let html = '';
        state.decks.forEach(d => {
            html += `
            <div class='deck-card' style='border-top: 4px solid ${d.color}'>
                <div style='font-size:2rem'>${d.icon}</div>
                <h3>${d.name}</h3>
                <p>${d.desc}</p>
                <p style="font-size:0.8rem; opacity:0.7">Карток: ${d.count || 0}</p>
                <div style="display:flex; gap:0.5rem; margin-top:1rem; flex-wrap: wrap;">
                    <button onclick="StudyModule.start('${d.id}')">Вчити</button>
                    <button class='secondary' onclick="QuizModule.start('${d.id}')">Тест</button>
                    <button class='secondary' style='background:#e74c3c; color:white;' onclick="StudyModule.startBlitz('${d.id}')">⚡ Бліц</button>
                </div>
            </div>`;
        });
        return html; 
    })
};
