import { StorageModule } from './storage.js';
 
export const CardsModule = {
  openModal() { document.getElementById('modal').classList.remove('hidden'); },
 
  createDeck() {
    const name  = document.getElementById('f-name').value.trim();
    const desc  = document.getElementById('f-desc').value.trim();
    const icon  = document.getElementById('f-icon').value.trim() || '📚';
    const color = document.getElementById('f-color').value;
    if (!name) { alert('Введи назву колоди!'); return; }
    const deck = { id:'d'+Date.now(), name, desc, icon, color, count:0, custom:true };
    window.state.decks.push(deck);
    StorageModule.save(window.state);
    document.getElementById('modal').classList.add('hidden');
    // Очищуємо поля
    ['f-name','f-desc','f-icon'].forEach(id => document.getElementById(id).value='');
    this.renderDecks(window.state);
  },
 
  deleteDeck(deckId) {
    if (!confirm('Видалити колоду разом з усіма картками?')) return;
    window.state.decks = window.state.decks.filter(d => d.id !== deckId);
    window.state.cards = window.state.cards.filter(c => c.deckId !== deckId);
    StorageModule.save(window.state);
    this.renderDecks(window.state);
  },
 
  renderDecks(state) {
    const grid = document.getElementById('decks-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!state.decks.length) {
      grid.innerHTML = '<p style="opacity:.6">Колод ще немає. Завантаження...</p>';
      return;
    }
    const sorted = [
      ...state.decks.filter(d => !d.custom),
      ...state.decks.filter(d =>  d.custom)
    ];
    sorted.forEach(deck => {
      const div = document.createElement('div');
      div.className = 'deck-card';
      div.style.borderColor = deck.color;
      div.innerHTML = `
        <div class='deck-icon'>${deck.icon}</div>
        <strong>${deck.name}</strong>
        <p class='deck-desc'>${deck.desc || ''}</p>
        <small>${deck.count} карток</small>
        <div class='deck-actions'>
          <button onclick='StudyModule.start("${deck.id}")'>📖 Вчити</button>
          <button onclick='QuizModule.start("${deck.id}")' class='secondary'>📝 Тест</button>
          <button onclick='VanishModule.start("${deck.id}")' class='secondary'>🌫️</button>
          ${deck.custom
            ? `<button onclick='CardsModule.deleteDeck("${deck.id}")' class='secondary'>🗑</button>`
            : ''}
        </div>`;
      grid.appendChild(div);
    });
  }
};