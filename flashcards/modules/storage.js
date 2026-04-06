
const KEY = 'flashcards v1';

const DEFAULT_STATE = {
  decks:    [],
  cards:    [],
  settings: { theme:'light', cardStyle:'classic', voiceOn:false },
  progress: {
    total:0, correct:0, streak:0, lastDate:null,
    activity:{}, done:[], fastAnswers:0, voiceCount:0, vanishMax:0
  },
  session:  { correct:0, wrong:0, timePerCard:[] }
};

export const StorageModule = {
  load() {
    const saved = localStorage.getItem(KEY);
    if (!saved) return structuredClone(DEFAULT_STATE);
    try {
      const p = JSON.parse(saved);
      return {
        ...structuredClone(DEFAULT_STATE), ...p,
        settings: { ...DEFAULT_STATE.settings, ...(p.settings || {}) },
        progress: { ...DEFAULT_STATE.progress, ...(p.progress || {}) },
        session:  { ...DEFAULT_STATE.session,  ...(p.session  || {}) }
      };
    } catch { return structuredClone(DEFAULT_STATE); }
  },

  save(state) { localStorage.setItem(KEY, JSON.stringify(state)); },
  reset()     { localStorage.removeItem(KEY); },

  exportFile(state) {
    const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
    const a = Object.assign(document.createElement('a'),
      { href:URL.createObjectURL(blob), download:'flashcards-backup.json' });
    a.click(); URL.revokeObjectURL(a.href);
  }
};



