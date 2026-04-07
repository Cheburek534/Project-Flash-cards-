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
 _startTimer() {
   this.left = this.limit;
   this._updateTimer();
   clearInterval(this.timer);
   this.timer = setInterval(() => {
     this.left--;
     this._updateTimer();
     if (this.left <= 0) { clearInterval(this.timer); this.answer(null); }
   }, 1000);
 }
 
 _updateTimer() {
   const el   = document.getElementById('quiz-timer');
   const fill = document.getElementById('timer-fill');
   if (el) {
     el.textContent = '⏱️ '+this.left+'с';
     el.classList.toggle('urgent', this.left <= 5);
   }
   if (fill) fill.style.width = (this.left/this.limit*100)+'%';
 }
 
 answer(selected) {
   clearInterval(this.timer);
   const q = this.qs[this.idx];
   const ok = selected !== null && (
     selected === q.answer ||
     (this.voice && this.voice.matches(selected, q.answer))
   );
   // Підсвічуємо кнопки
   document.querySelectorAll('.opt').forEach(btn => {
     btn.disabled = true;
     const txt = btn.textContent.slice(3);
     if (txt === q.answer) btn.classList.add('right');
     else if (selected && txt === selected) btn.classList.add('wrong');
   });
   if (ok) {
     this.score += 10 + Math.round(this.left / this.limit * 10);
     if (this.left > 12) {
       this.state.progress.fastAnswers =
         (this.state.progress.fastAnswers || 0) + 1;
     }
   }
   setTimeout(() => { this.idx++; this._showQ(); }, 1500);
 }
 
 listenVoice() {
   if (!this.voice?.ok) { alert('Голос не підтримується'); return; }
   this.voice.listen(text => this.answer(text));
 }
 
 _end() {
   clearInterval(this.timer);
   const max = this.qs.length * 20;
   const pct = Math.round(this.score / max * 100);
   document.getElementById('quiz-options').innerHTML   = '';
   document.getElementById('quiz-question').textContent = '';
   document.getElementById('quiz-final-score').textContent = this.score+' / '+max;
   document.getElementById('quiz-final-pct').textContent   = pct+'%';
   document.getElementById('quiz-result').classList.remove('hidden');
   if (window.AchievementsModule) window.AchievementsModule.check(this.state);
   StorageModule.save(this.state);
 }
}