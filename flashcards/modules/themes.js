import { StorageModule } from './storage.js';

export const ThemeModule = {
  THEMES: ['light', 'dark'],  // Поки дві теми, розширимо в тижні 4

  apply(theme, style) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-card-style', style);
  },

  cycle() {
    const cur  = document.documentElement.getAttribute('data-theme');
    const next = cur === 'light' ? 'dark' : 'light';
    window.state.settings.theme = next;
    this.apply(next, window.state.settings.cardStyle);
    StorageModule.save(window.state);
    document.getElementById('theme-btn').textContent = next === 'dark' ? '☀️' : '🌙';
  }
};
