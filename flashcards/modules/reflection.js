export const ReflectionModule = {

  showAfterSession(state) {
    const s       = state.session;
    const total   = s.correct + s.wrong;
    const pct     = total ? Math.round(s.correct / total * 100) : 0;
    const avgT    = s.timePerCard.length
      ? (s.timePerCard.reduce((a,b)=>a+b,0)/s.timePerCard.length).toFixed(1)
      : 0;
    document.getElementById('r-pct').textContent = pct + '%';
    document.getElementById('r-avg').textContent = avgT + 'с';
    this._drawChart(s.timePerCard);
    document.getElementById('modal-reflect').classList.remove('hidden');
  },

  _drawChart(times) {
    const canvas = document.getElementById('r-chart');
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!times.length) return;
    const max = Math.max(...times, 1);
    const w   = canvas.width / times.length;
    times.forEach((t, i) => {
      const h = (t / max) * (canvas.height - 10);
      ctx.fillStyle = t <= 5 ? '#27AE60' : '#E74C3C';
      ctx.fillRect(i * w + 2, canvas.height - h, w - 4, h);
    });
  },

  render(state) {
    const p   = state.progress;
    const pct = p.total ? Math.round(p.correct / p.total * 100) : 0;
    document.getElementById('stat-total').textContent  = p.total;
    document.getElementById('stat-pct').textContent    = pct + '%';
    document.getElementById('stat-streak').textContent = p.streak + ' днів';
    document.getElementById('stat-badges').textContent = p.done.length;
    this._drawHeatmap(p.activity);
    this._showWeak(state.cards);
  },

  _drawHeatmap(activity) {
    const canvas = document.getElementById('heatmap-canvas');
    const ctx = canvas.getContext('2d');
    const size = 20, gap = 4;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const max = Math.max(...Object.values(activity), 1);
    for (let i = 0; i < 28; i++) {
      const d = new Date(); d.setDate(d.getDate() - (27 - i));
      const count = activity[d.toISOString().slice(0,10)] || 0;
      const g = Math.round(150 + (count / max) * 100);
      ctx.fillStyle = count === 0 ? '#E0E0E0' : `rgb(0,${g},60)`;
      ctx.beginPath();
      ctx.roundRect(Math.floor(i/7)*(size+gap), (i%7)*(size+gap),size,size,3);
      ctx.fill();
    }
  },

  _showWeak(cards) {
    const weak = cards
      .filter(c => c.stats.seen >= 3)
      .map(c => ({...c, pct: c.stats.right / c.stats.seen}))
      .sort((a,b) => a.pct - b.pct).slice(0, 3);
    const el = document.getElementById('weak-list');
    if (!el) return;
    el.innerHTML = weak.length
      ? weak.map(c=>`<div class='weak-card'>${c.front} - ${Math.round(c.pct*100)}% правильно</div>`).join('')
      : '<p style="opacity:.6">Ще недостатньо даних. Вчись далі!</p>';
  }
};
