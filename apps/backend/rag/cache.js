export class TTLCache {
    constructor({ ttlMs = 60_000, max = 200 } = {}) {
      this.ttlMs = ttlMs;
      this.max = max;
      this.map = new Map(); // key -> { value, expires }
    }
    _now() { return Date.now(); }
  
    get(key) {
      const e = this.map.get(key);
      if (!e) return null;
      if (e.expires < this._now()) { this.map.delete(key); return null; }
      return e.value;
    }
    set(key, value) {
      if (this.map.size >= this.max) {
        // simple LRU-ish: delete first key
        const k = this.map.keys().next().value;
        if (k) this.map.delete(k);
      }
      this.map.set(key, { value, expires: this._now() + this.ttlMs });
    }
  }
  