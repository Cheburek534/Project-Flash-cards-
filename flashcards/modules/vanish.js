import { StorageModule } from './storage.js';
 
export class VanishModule {
  constructor(state) {
    this.state  = state;
    this.cards  = [];
    this.idx    = 0;
    this.level  = 1;
    this.hidden = [];
  }
 
  start(deckId) {
    this.cards = this.state.cards
      .filter(c => c.deckId === deckId)
      .sort(() => Math.random() - 0.5);
    if (!this.cards.length) { alert('В колоді немає карток!'); return; }
    this.idx = 0; this.level = 1;
    showPage('vanish');
    this._show();
  }
 
  _hide(text, level) {
    const words = text.split(/\s+/);
    const cands = [];
    words.forEach((w,i) => {
      const clean = w.replace(/[^а-яіїєґА-ЯІЇЄҐa-zA-Z0-9]/g,'');
      if (clean.length > 3) cands.push(i);
    });
    if (!cands.length) return { html:text, hidden:[] };
    const toHide = cands.sort(()=>Math.random()-.5)
      .slice(0, Math.min(level, cands.length));
    const set  = new Set(toHide);
    const hidden = toHide.map(i =>
      words[i].replace(/[^а-яіїєґА-ЯІЇЄҐa-zA-Z0-9]/g,''));
    const html = words.map((w,i) =>
      set.has(i) ? "<span class='vanish-blank'>___</span>" : w
    ).join(' ');
    return { html, hidden };
  }
 
  _show() {
    const card = this.cards[this.idx];
    if (!card) { this._done(); return; }
    document.getElementById('vanish-q').textContent = card.front;
    const { html, hidden } = this._hide(card.back, this.level);
    this.hidden = hidden;
    document.getElementById('vanish-a').innerHTML  = html;
    document.getElementById('vanish-hint').textContent =
      'Знайди '+hidden.length+' пропущених слів';
    document.getElementById('vanish-input').value = '';
    document.getElementById('vanish-msg').classList.add('hidden');
    document.getElementById('vanish-lvl').textContent = 'Рівень '+this.level;
    document.getElementById('vanish-input').focus();
  }
 
  check() {
    const input = document.getElementById('vanish-input').value.toLowerCase().trim();
    const ok    = this.hidden.every(w => input.includes(w.toLowerCase()));
    const msg   = document.getElementById('vanish-msg');
    msg.classList.remove('hidden');
    if (ok) {
      msg.textContent  = '✅ Правильно!';
      msg.style.color  = 'var(--ok)';
      const prev = this.state.progress.vanishMax || 0;
      if (this.level > prev) {
        this.state.progress.vanishMax = this.level;
        StorageModule.save(this.state);
      }
      setTimeout(() => {
        this.idx++;
        if (this.idx % 3 === 0) this.level++;
        this._show();
      }, 1200);
    } else {
      msg.textContent = '❌ Пропущені: ' + this.hidden.join(', ');
      msg.style.color = 'var(--fail)';
    }
  }
 
  reveal() {
    const card = this.cards[this.idx];
    if (card) document.getElementById('vanish-a').textContent = card.back;
  }
 
  hideMore() {
    const card = this.cards[this.idx];
    if (!card) return;
    const wc    = card.back.split(/\s+/).length;
    const extra = Math.max(1, Math.round(wc * 0.15));
    this.level  = Math.min(this.level + extra, wc);
    document.getElementById('vanish-lvl').textContent = 'Рівень '+this.level;
    this._show();
  }
 
  _done() {
    document.getElementById('vanish-q').textContent =
      '🎉 Готово! Максимальний рівень: ' + this.level;
    document.getElementById('vanish-a').textContent = '';
    document.getElementById('vanish-hint').textContent = '';
    if (window.AchievementsModule) window.AchievementsModule.check(this.state);
  }
}