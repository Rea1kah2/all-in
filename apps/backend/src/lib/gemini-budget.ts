import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Penghitung panggilan Gemini per model per hari.
 *
 * Kuota free tier Gemini dihitung per project per model per hari, dan direset di
 * tengah malam waktu Pacific. Penghitung ini memakai batas hari yang sama supaya
 * hitungannya tidak pernah bergeser dari hitungan Google.
 *
 * Isinya ditulis ke berkas karena `tsx watch` me-restart proses setiap kali kode
 * disentuh. Penghitung yang hanya hidup di memori akan selalu kembali ke nol dan
 * tidak menjaga apa pun.
 */

type BudgetFile = {
  date: string;
  counts: Record<string, number>;
};

const pacificDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function pacificDate(now: Date = new Date()): string {
  return pacificDateFormatter.format(now);
}

export class GeminiBudget {
  private date: string;
  private counts: Record<string, number>;

  constructor(
    private readonly dailyLimit: number,
    private readonly persistPath: string | null = null,
  ) {
    const loaded = this.load();
    this.date = loaded.date;
    this.counts = loaded.counts;
  }

  private load(): BudgetFile {
    const today = pacificDate();
    if (!this.persistPath) {
      return { date: today, counts: {} };
    }

    try {
      const raw = JSON.parse(readFileSync(this.persistPath, "utf8")) as BudgetFile;
      if (raw.date === today && raw.counts && typeof raw.counts === "object") {
        return { date: today, counts: { ...raw.counts } };
      }
    } catch {
      // Berkas belum ada atau rusak, mulai dari nol.
    }

    return { date: today, counts: {} };
  }

  private save(): void {
    if (!this.persistPath) return;

    try {
      mkdirSync(dirname(this.persistPath), { recursive: true });
      writeFileSync(
        this.persistPath,
        JSON.stringify({ date: this.date, counts: this.counts }),
        "utf8",
      );
    } catch (error) {
      console.error("Gagal menyimpan penghitung kuota Gemini", error);
    }
  }

  private rollOver(): void {
    const today = pacificDate();
    if (today !== this.date) {
      this.date = today;
      this.counts = {};
    }
  }

  used(model: string): number {
    this.rollOver();
    return this.counts[model] ?? 0;
  }

  remaining(model: string): number {
    return Math.max(this.dailyLimit - this.used(model), 0);
  }

  hasRoom(model: string): boolean {
    return this.remaining(model) > 0;
  }

  /** Dipanggil tepat sebelum panggilan dikirim, supaya percobaan yang gagal tetap dihitung. */
  record(model: string): void {
    this.rollOver();
    this.counts[model] = (this.counts[model] ?? 0) + 1;
    this.save();
  }

  snapshot(): { date: string; limit: number; used: Record<string, number> } {
    this.rollOver();
    return { date: this.date, limit: this.dailyLimit, used: { ...this.counts } };
  }
}
