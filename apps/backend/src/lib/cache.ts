import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

type Entry<T> = { value: T; expiresAt: number };

const MAX_ENTRIES = 200;

export class TtlCache<T> {
  private readonly store = new Map<string, Entry<T>>();

  /**
   * `persistPath` membuat isi cache bertahan melewati restart proses. Ini penting
   * karena `tsx watch` me-restart tiap kali kode disentuh, sementara satu entri
   * cache di sini mewakili tiga panggilan Gemini yang sudah terpakai dari jatah
   * harian yang sangat terbatas.
   */
  constructor(
    private readonly ttlMs: number,
    private readonly persistPath: string | null = null,
  ) {
    this.load();
  }

  private load(): void {
    if (!this.persistPath || this.ttlMs <= 0) return;

    try {
      const raw = JSON.parse(readFileSync(this.persistPath, "utf8")) as Record<
        string,
        Entry<T>
      >;
      const now = Date.now();
      for (const [key, entry] of Object.entries(raw)) {
        if (entry && entry.expiresAt > now) {
          this.store.set(key, entry);
        }
      }
    } catch {
      // Berkas belum ada atau rusak, mulai dengan cache kosong.
    }
  }

  private save(): void {
    if (!this.persistPath) return;

    try {
      mkdirSync(dirname(this.persistPath), { recursive: true });
      writeFileSync(
        this.persistPath,
        JSON.stringify(Object.fromEntries(this.store)),
        "utf8",
      );
    } catch (error) {
      console.error("Gagal menyimpan cache analisis", error);
    }
  }

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
    this.save();
  }
}
