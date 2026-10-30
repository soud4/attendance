/**
 * Date & Timezone Utilities for Peru (America/Lima — UTC-5)
 *
 * Ensures all dates, times, auto-close evaluations, and UI displays
 * are accurately evaluated in Peru timezone across all environments
 * (local laptop, Docker Alpine runner, and cloud VPS instances in UTC).
 */

export const PERU_TIMEZONE = "America/Lima";
export const PERU_TIMEZONE_OFFSET = "-05:00";

/**
 * Returns today's date in Peru as 'YYYY-MM-DD'
 */
export function getPeruDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PERU_TIMEZONE }).format(date);
}

/**
 * Parse an ISO date or datetime string ensuring Peru timezone (America/Lima, UTC-5)
 * when no timezone offset is explicitly provided.
 */
export function parsePeruDateTime(raw: string | null | undefined): Date | null {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();

  // 1. If already contains timezone indicator ('Z' or '+HH:mm' or '-HH:mm')
  if (/Z|[+-]\d{2}:?\d{2}$/i.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // 2. If format YYYY-MM-DDTHH:mm or YYYY-MM-DD HH:mm (optional seconds)
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?/.test(s)) {
    const normalized = s.replace(" ", "T");
    const withOffset = normalized.length === 16 ? `${normalized}:00${PERU_TIMEZONE_OFFSET}` : `${normalized}${PERU_TIMEZONE_OFFSET}`;
    const d = new Date(withOffset);
    return isNaN(d.getTime()) ? null : d;
  }

  // 3. If date only: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00${PERU_TIMEZONE_OFFSET}`);
    return isNaN(d.getTime()) ? null : d;
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Formats a Date/string/number as 'DD/MM/YYYY' in Peru Time
 */
export function formatDatePeru(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "object" ? date : (parsePeruDateTime(String(date)) || new Date(date));
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: PERU_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a Date/string/number as 'HH:mm' in Peru Time (24h or 12h)
 */
export function formatTimePeru(
  date: Date | string | number | null | undefined,
  options?: { hour12?: boolean }
): string {
  if (!date) return "-";
  const d = typeof date === "object" ? date : (parsePeruDateTime(String(date)) || new Date(date));
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: PERU_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: options?.hour12 ?? false,
  }).format(d);
}

/**
 * Formats a Date/string/number as 'DD/MM/YYYY, HH:mm' in Peru Time
 */
export function formatDateTimePeru(
  date: Date | string | number | null | undefined,
  options?: { hour12?: boolean }
): string {
  if (!date) return "-";
  const d = typeof date === "object" ? date : (parsePeruDateTime(String(date)) || new Date(date));
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: PERU_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: options?.hour12 ?? false,
  }).format(d);
}

/**
 * Formats an event date in Spanish friendly format (e.g. 'Jueves, 29 de Octubre de 2026')
 * respecting the Peru timezone.
 */
export function formatSpanishDate(startsAt: string | null, createdAt: string): string {
  const candidate = (startsAt && /\d{4}/.test(startsAt) ? startsAt : null) || createdAt;
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  if (!candidate || !candidate.trim()) {
    const todayStr = getPeruDateString();
    const parts = todayStr.split("-").map((n) => parseInt(n, 10));
    const utcDate = new Date(Date.UTC(parts[0]!, parts[1]! - 1, parts[2]!, 12, 0, 0));
    return `${days[utcDate.getUTCDay()]}, ${parts[2]} de ${months[parts[1]! - 1]} de ${parts[0]}`;
  }

  const raw = candidate.trim();

  // If raw candidate has ISO timestamp with timezone (e.g. '2026-10-30T04:18:26.000Z')
  if (raw.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(raw)) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const peruDateStr = getPeruDateString(d); // "YYYY-MM-DD" in Peru
      const [y, m, day] = peruDateStr.split("-").map((n) => parseInt(n, 10));
      const utcDate = new Date(Date.UTC(y!, m! - 1, day!, 12, 0, 0));
      return `${days[utcDate.getUTCDay()]}, ${day} de ${months[m! - 1]} de ${y}`;
    }
  }

  // If format starts with YYYY-MM-DD without explicit timezone
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1]!, 10);
    const month = parseInt(match[2]!, 10) - 1;
    const day = parseInt(match[3]!, 10);
    const utcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
    return `${days[utcDate.getUTCDay()]}, ${day} de ${months[month]} de ${year}`;
  }

  // Fallback
  const parsed = parsePeruDateTime(raw);
  if (parsed && !isNaN(parsed.getTime())) {
    const peruDateStr = getPeruDateString(parsed);
    const [y, m, day] = peruDateStr.split("-").map((n) => parseInt(n, 10));
    const utcDate = new Date(Date.UTC(y!, m! - 1, day!, 12, 0, 0));
    return `${days[utcDate.getUTCDay()]}, ${day} de ${months[m! - 1]} de ${y}`;
  }

  return "Fecha no disponible";
}

/**
 * Formats time string into clean 12-hour AM/PM format (e.g. '08:30 AM', '06:00 PM')
 */
export function cleanTimeDisplay(val: string | null, defaultFallback: string): string {
  if (!val || !val.trim()) return defaultFallback;
  const raw = val.trim();

  // 1. If it's an ISO timestamp with Z or timezone offset (e.g. '2026-10-30T04:18:26.000Z')
  if (raw.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(raw)) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: PERU_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).formatToParts(d);
      const h = parts.find((p) => p.type === "hour")?.value || "12";
      const m = parts.find((p) => p.type === "minute")?.value || "00";
      const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value?.toUpperCase() || "AM";
      return `${h.padStart(2, "0")}:${m} ${dayPeriod}`;
    }
  }

  // 2. If it's an ISO datetime like '2026-10-29T08:30' or '2026-10-29 08:30:00'
  if (raw.includes("T") || (/\d{4}-\d{2}-\d{2}/.test(raw) && raw.includes(":"))) {
    const timePart = raw.split(/[T ]/)[1];
    if (timePart) {
      const parts = timePart.split(":");
      let h = parseInt(parts[0]!, 10);
      const m = parts[1] || "00";
      const ampm = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
    }
  }

  // 3. Simple time like '08:30' or '18:00'
  const timeMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1]!, 10);
    const m = timeMatch[2] || "00";
    const explicitAmPm = timeMatch[4];
    if (explicitAmPm) {
      return `${String(h).padStart(2, "0")}:${m} ${explicitAmPm.toUpperCase()}`;
    }
    const ampm = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
  }

  return raw;
}
