export class VoiceModule {
  constructor() {
    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.ok = !!API;
    this.busy = false;
    this.onDone = null;
    if (!this.ok) return;
    this.rec = new API();
    this.rec.lang = "uk-UA";
    this.rec.continuous = false;
    this.rec.interimResults = true;
    this.rec.maxAlternatives = 1;
    this.rec.onresult = (e) => {
      const res = e.results[e.results.length - 1];
      const text = res[0].transcript.trim().toLowerCase();
      const final = res.isFinal; 
      ["voice-preview", "voice-quiz-preview"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      });
      if (final && this.onDone) {
        this.onDone(text);
        this.stop();
      }
    };
    this.rec.onerror = (e) => {
      this.busy = false;
      this._setBtn("idle");
      if (e.error === "not-allowed")
        alert("Дозволь доступ до мікрофону в браузері!");
    };
    this.rec.onend = () => {
      this.busy = false;
      this._setBtn("idle");
    };
  }
  listen(callback) {
    if (!this.ok) {
      alert("Web Speech API не підтримується. Використай Chrome.");
      return;
    }
    if (this.busy) return;
    this.onDone = callback;
    this.busy = true;
    this._setBtn("listening");
    this.rec.start();
  }
  stop() {
    if (this.busy) {
      this.rec.stop();
      this.busy = false;
    }
  } 
  normalize(str) {
    return str
      .toLowerCase()
      .replace(/[^а-яіїєґa-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  matches(spoken, expected) {
    const s = this.normalize(spoken);
    const e = this.normalize(expected);
    if (!s) return false;
    if (s === e || e.includes(s) || s.includes(e)) return true;
    const words = e.split(" ").filter((w) => w.length > 3);
    if (!words.length) return s.includes(e);
    const found = words.filter((w) => s.includes(w)).length;
    return found / words.length >= 0.6;
  }
  _setBtn(status) {
    ["voice-study-btn", "voice-quiz-btn"].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      if (status === "listening") {
        btn.textContent = "🔴 Слухаю...";
        btn.classList.add("listening");
      } else {
        btn.textContent = id.includes("quiz")
          ? "🎤 Голосова відповідь"
          : "🎤 Відповісти голосом";
        btn.classList.remove("listening");
      }
    });
  }
}
