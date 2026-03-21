
const KEY = 'flashcards_v1';

const DEFAULT_STATE = {
  decks:    [],
  cards:    [],
  settings: { theme: 'light', cardStyle: 'classic', voiceOn: false },
  progress: {
    total: 0, correct: 0, streak: 0,
    lastDate: null, activity: {}, done: []
  }
};

export const StorageModule = {
  load() {
    const saved = localStorage.getItem(KEY);
    if (!saved) return structuredClone(DEFAULT_STATE);
    try   { return JSON.parse(saved); }
    catch { return structuredClone(DEFAULT_STATE); }
  },
  save(state)  { localStorage.setItem(KEY, JSON.stringify(state)); },
  reset()      { localStorage.removeItem(KEY); }
};


