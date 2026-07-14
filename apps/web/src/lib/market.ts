export type MarketPhase = "open" | "pre" | "after" | "closed";

export type MarketReading = {
  phase: MarketPhase;
  label: string;
  timeLabel: string;
};

const EXCHANGE_TIMEZONE = "America/New_York";

const PRE_MARKET_START = 4 * 60;
const REGULAR_START = 9 * 60 + 30;
const REGULAR_END = 16 * 60;
const AFTER_MARKET_END = 20 * 60;

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function readMarket(now: Date): MarketReading {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EXCHANGE_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = partValue(parts, "weekday");
  const hour = Number(partValue(parts, "hour"));
  const minute = Number(partValue(parts, "minute"));
  const minutesOfDay = hour * 60 + minute;

  const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ET`;

  if (weekday === "Sat" || weekday === "Sun") {
    return { phase: "closed", label: "Pasar Tutup", timeLabel };
  }

  if (minutesOfDay >= REGULAR_START && minutesOfDay < REGULAR_END) {
    return { phase: "open", label: "Pasar Buka", timeLabel };
  }

  if (minutesOfDay >= PRE_MARKET_START && minutesOfDay < REGULAR_START) {
    return { phase: "pre", label: "Pra Pembukaan", timeLabel };
  }

  if (minutesOfDay >= REGULAR_END && minutesOfDay < AFTER_MARKET_END) {
    return { phase: "after", label: "Pasca Penutupan", timeLabel };
  }

  return { phase: "closed", label: "Pasar Tutup", timeLabel };
}
