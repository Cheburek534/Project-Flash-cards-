import { StorageModule } from './storage.js';
 
export const AchievementsModule = {
  list: [],
 
  async load() {
    const data = await fetch('./data/achievements.json').then(r => r.json());
    this.list = data.list;
  },
 
  check(state) {
    const p = state.progress;
    const newOnes = [];
    this.list.forEach(a => {
      if (p.done.includes(a.id)) return;
      let ok = false;
      switch (a.type) {
        case 'total':    ok = p.total  >= a.val; break;
        case 'streak':   ok = p.streak >= a.val; break;
        case 'speed':    ok = (p.fastAnswers||0) >= a.val; break;
        case 'voice':    ok = (p.voiceCount ||0) >= a.val; break;
        case 'vanish':   ok = (p.vanishMax  ||0) >= a.val; break;
        case 'custom':   ok = state.decks.filter(d=>d.custom).length >= a.val; break;
        case 'accuracy':
          if (p.total >= (a.min||0))
            ok = (p.correct/p.total*100) >= a.val;
          break;
      }
      if (ok) { p.done.push(a.id); newOnes.push(a); }
    });
    if (newOnes.length) {
      StorageModule.save(state);
      newOnes.forEach((a,i) => setTimeout(()=>this._toast(a), i*4500));
    }
    return newOnes;
  },
 
  _toast(a) {
    const el = document.getElementById('toast');
    el.innerHTML = `
      <span style='font-size:2rem'>${a.icon}</span>
      <div>
        <div style='font-size:.75rem;opacity:.7'>🏆 Нове досягнення!</div>
        <strong>${a.title}</strong>
        <div style='font-size:.85rem'>${a.desc}</div>
      </div>
      <strong style='color:var(--accent);margin-left:auto'>+${a.pts}</strong>`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
  },
 
  renderAll(state) {
    const grid = document.getElementById('badges-grid');
    if (!grid) return;
    const done   = new Set(state.progress.done);
    const total  = this.list.filter(a=>done.has(a.id)).reduce((s,a)=>s+a.pts,0);
    const el = document.getElementById('total-pts');
    if (el) el.textContent = total;
    grid.innerHTML = '';
    this.list.forEach(a => {
      const div = document.createElement('div');
      const unlocked = done.has(a.id);
      div.className = 'badge ' + (unlocked ? 'unlocked' : 'locked');
      div.innerHTML = `
        <span style='font-size:2.2rem'>${unlocked ? a.icon : '🔒'}</span>
        <div><strong>${a.title}</strong></div>
        <small>${unlocked ? a.desc : '???'}</small>
        <small style='color:var(--accent)'>${a.pts} очок</small>`;
      grid.appendChild(div);
    });
  }
};