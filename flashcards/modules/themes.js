import { StorageModule } from './storage.js';
 
export const ThemeModule = {
  THEMES: ['light','dark','ocean','forest'],
  STYLES: ['classic','neon','minimal','retro'],
 
  apply(theme, style) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-card-style', style);
    const icons = { light:'🌙', dark:'☀️', ocean:'🌊', forest:'🌲' };
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = icons[theme] || '🌙';
  },
 
  cycle() {
    const cur  = document.documentElement.getAttribute('data-theme');
    const idx  = this.THEMES.indexOf(cur);
    const next = this.THEMES[(idx + 1) % this.THEMES.length];
    window.state.settings.theme = next;
    this.apply(next, window.state.settings.cardStyle);
    StorageModule.save(window.state);
  },
 
  setTheme(theme) {
    if (!this.THEMES.includes(theme)) return;
    window.state.settings.theme = theme;
    this.apply(theme, window.state.settings.cardStyle);
    StorageModule.save(window.state);
    this.renderPickers();
  },
 
  setStyle(style) {
    if (!this.STYLES.includes(style)) return;
    window.state.settings.cardStyle = style;
    this.apply(window.state.settings.theme, style);
    StorageModule.save(window.state);
    this.renderPickers();
  },
 
  renderPickers() {
    const tp = document.getElementById('theme-picker');
    const sp = document.getElementById('style-picker');
    if (!tp || !sp) return;
    const themeNames = { light:'☀️ Світла', dark:'🌙 Темна', ocean:'🌊 Океан', forest:'🌲 Ліс' };
    const styleNames = { classic:'Classic', neon:'Neon', minimal:'Minimal', retro:'Retro' };
    const cur = window.state.settings;
    tp.innerHTML = '';
    this.THEMES.forEach(t => {
      const b = document.createElement('button');
      b.textContent = themeNames[t];
      b.className = 'secondary' + (t === cur.theme ? ' active-pick' : '');
      b.onclick = () => this.setTheme(t);
      tp.appendChild(b);
    });
    sp.innerHTML = '';
    this.STYLES.forEach(s => {
      const b = document.createElement('button');
      b.textContent = styleNames[s];
      b.className = 'secondary' + (s === cur.cardStyle ? ' active-pick' : '');
      b.onclick = () => this.setStyle(s);
      sp.appendChild(b);
    });
  }
};
