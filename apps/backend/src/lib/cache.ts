type Entry<T> = { value: T; expiresAt: number };

const MAX_ENTRIES = 200;

export class TtlCache<T> {
  private readonly store = new Map<string, Entry<T>>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | null {
    if (this.ttlMs <= 0) return null;

    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.ttlMs <= 0) return;

    if (this.store.size >= MAX_ENTRIES) {
      const oldest = this.store.keys().next();
      if (!oldest.done) this.store.delete(oldest.value);
    }

    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
