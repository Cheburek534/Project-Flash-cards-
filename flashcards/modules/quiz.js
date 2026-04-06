import { StorageModule } from './storage.js';
 
export class QuizModule {
 constructor(state, voice) {
   this.state  = state;
   this.voice  = voice;
   this.qs     = [];
   this.idx    = 0;
   this.score  = 0;
   this.timer  = null;
   this.left   = 15;
   this.limit  = 15;
 }
 
 start(deckId, count = 10) {
   const all = this.state.cards.filter(c => c.deckId === deckId);
   if (!all.length) { alert('В колоді немає карток!'); return; }
   this.qs = all.sort(() => Math.random() - 0.5)
     .slice(0, Math.min(count, all.length))
     .map(c => this._makeQuestion(c));
   this.idx = 0; this.score = 0;
   showPage('quiz');
   document.getElementById('quiz-result').classList.add('hidden');
   this._showQ();
 }
 
 _makeQuestion(card) {
   const wrong = this.state.cards
     .filter(c => c.id !== card.id && c.back !== card.back)
     .sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.back);
   // Якщо карток мало — додаємо заглушки
   while (wrong.length < 3) wrong.push('— невідомо —');
   const opts = [...wrong, card.back].sort(() => Math.random() - 0.5);
   return { q: card.front, answer: card.back, opts };
 }
 
 _showQ() {
   const q = this.qs[this.idx];
   if (!q) { this._end(); return; }
   document.getElementById('quiz-question').textContent = q.q;
   document.getElementById('quiz-counter').textContent =
     (this.idx+1)+' / '+this.qs.length;
   document.getElementById('quiz-score').textContent = this.score+' балів';
   const box = document.getElementById('quiz-options');
   box.innerHTML = '';
   q.opts.forEach((opt, i) => {
     const btn = document.createElement('button');
     btn.className = 'opt secondary';
     btn.textContent = ['A','B','C','D'][i]+'. '+opt;
     btn.onclick = () => this.answer(opt);
     box.appendChild(btn);
   });
   ['voice-quiz-preview'].forEach(id => {
     const el=document.getElementById(id); if(el) el.textContent='';
   });
   this._startTimer();
 }