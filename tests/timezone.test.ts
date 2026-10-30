import { describe, it, expect } from "bun:test";
import {
  PERU_TIMEZONE,
  PERU_TIMEZONE_OFFSET,
  getPeruDateString,
  parsePeruDateTime,
  formatDatePeru,
  formatTimePeru,
  formatDateTimePeru,
  formatSpanishDate,
  cleanTimeDisplay,
} from "../src/utils/date";
import { isEventExpired } from "../src/services/event.service";
import type { Event } from "../src/db";

describe("Timezone Utilities & Peru Local Time Handling (America/Lima)", () => {
  it("should have correct timezone constants", () => {
    expect(PERU_TIMEZONE).toBe("America/Lima");
    expect(PERU_TIMEZONE_OFFSET).toBe("-05:00");
  });

  describe("getPeruDateString", () => {
    it("should return the correct Peru calendar date late in the evening when UTC is already next day", () => {
      // 2026-10-30 at 04:15:00 UTC is 2026-10-29 at 23:15:00 in Peru (UTC-5)
      const lateEveningUtc = new Date("2026-10-30T04:15:00.000Z");
      expect(getPeruDateString(lateEveningUtc)).toBe("2026-10-29");

      // 2026-10-30 at 05:01:00 UTC is 2026-10-30 at 00:01:00 in Peru (UTC-5)
      const pastMidnightUtc = new Date("2026-10-30T05:01:00.000Z");
      expect(getPeruDateString(pastMidnightUtc)).toBe("2026-10-30");
    });
  });

  describe("parsePeruDateTime", () => {
    it("should parse datetime strings without timezone as Peru local time (UTC-5)", () => {
      const parsed = parsePeruDateTime("2026-10-29T23:30");
      expect(parsed).not.toBeNull();
      // 23:30 Peru time should equal 04:30 UTC next day
      expect(parsed!.toISOString()).toBe("2026-10-30T04:30:00.000Z");
    });

    it("should parse space-separated datetimes as Peru local time", () => {
      const parsed = parsePeruDateTime("2026-10-29 18:00:00");
      expect(parsed).not.toBeNull();
      expect(parsed!.toISOString()).toBe("2026-10-29T23:00:00.000Z");
    });

    it("should parse date-only strings as start of day in Peru", () => {
      const parsed = parsePeruDateTime("2026-10-29");
      expect(parsed).not.toBeNull();
      // 00:00:00 Peru is 05:00:00 UTC
      expect(parsed!.toISOString()).toBe("2026-10-29T05:00:00.000Z");
    });

    it("should preserve explicit timezone indicators when provided", () => {
      const parsedZ = parsePeruDateTime("2026-10-29T12:00:00.000Z");
      expect(parsedZ!.toISOString()).toBe("2026-10-29T12:00:00.000Z");

      const parsedExplicit = parsePeruDateTime("2026-10-29T12:00:00-05:00");
      expect(parsedExplicit!.toISOString()).toBe("2026-10-29T17:00:00.000Z");
    });
  });

  describe("formatDatePeru, formatTimePeru, formatDateTimePeru", () => {
    // 2026-10-30T04:15:00.000Z = 2026-10-29 23:15:00 in Peru
    const sampleUtc = "2026-10-30T04:15:00.000Z";

    it("should format date strictly in Peru timezone", () => {
      expect(formatDatePeru(sampleUtc)).toBe("29/10/2026");
    });

    it("should format 24h time strictly in Peru timezone", () => {
      expect(formatTimePeru(sampleUtc)).toBe("23:15");
    });

    it("should format combined datetime strictly in Peru timezone", () => {
      const formatted = formatDateTimePeru(sampleUtc);
      expect(formatted).toContain("29/10/2026");
      expect(formatted).toContain("23:15");
    });
  });

  describe("formatSpanishDate", () => {
    it("should render day of week and month in Spanish according to Peru date", () => {
      // 2026-10-30T04:15:00.000Z is Thursday, Oct 29 in Peru
      const formatted = formatSpanishDate(null, "2026-10-30T04:15:00.000Z");
      expect(formatted).toBe("Jueves, 29 de Octubre de 2026");
    });

    it("should render starts_at date when provided as YYYY-MM-DD", () => {
      const formatted = formatSpanishDate("2026-11-01", "2026-10-29T12:00:00.000Z");
      expect(formatted).toBe("Domingo, 1 de Noviembre de 2026");
    });
  });

  describe("cleanTimeDisplay", () => {
    it("should convert UTC ISO timestamp to Peru local 12-hour AM/PM format", () => {
      // 04:30 UTC = 11:30 PM Peru
      const result = cleanTimeDisplay("2026-10-30T04:30:00.000Z", "08:00 AM");
      expect(result).toBe("11:30 PM");
    });

    it("should convert local 24h format to 12-hour AM/PM", () => {
      expect(cleanTimeDisplay("18:00", "08:00 AM")).toBe("06:00 PM");
      expect(cleanTimeDisplay("08:30", "08:00 AM")).toBe("08:30 AM");
      expect(cleanTimeDisplay("23:45", "08:00 AM")).toBe("11:45 PM");
      expect(cleanTimeDisplay("00:15", "08:00 AM")).toBe("12:15 AM");
    });
  });

  describe("isEventExpired with Peru Timezone Awareness", () => {
    const mockEventBase: Event = {
      id: 999,
      public_code: "ev-testtz",
      title: "Evento Test Timezone",
      location_name: "Tacna",
      latitude: -18.0065,
      longitude: -70.2462,
      radius_meters: 100,
      starts_at: "2026-10-29T18:00",
      ends_at: "2026-10-29T23:30",
      status: "OPEN",
      created_by_user_id: 1,
      opened_at: "2026-10-29T23:00:00.000Z",
      closed_at: null,
      created_at: "2026-10-29T23:00:00.000Z",
    };

    it("should NOT consider event expired before ends_at in Peru time", () => {
      // ends_at is 2026-10-29T23:30 (Peru) = 2026-10-30T04:30:00.000Z
      // Simulate current time is 2026-10-29T23:15 Peru (2026-10-30T04:15:00.000Z)
      const originalNow = Date.now;
      try {
        Date.now = () => new Date("2026-10-30T04:15:00.000Z").getTime();
        expect(isEventExpired(mockEventBase)).toBe(false);
      } finally {
        Date.now = originalNow;
      }
    });

    it("should consider event expired after ends_at in Peru time", () => {
      // Simulate current time is 2026-10-29T23:35 Peru (2026-10-30T04:35:00.000Z)
      const originalNow = Date.now;
      try {
        Date.now = () => new Date("2026-10-30T04:35:00.000Z").getTime();
        expect(isEventExpired(mockEventBase)).toBe(true);
      } finally {
        Date.now = originalNow;
      }
    });

    it("should correctly handle simple time ends_at created late in the evening", () => {
      // Event created at 23:10 Peru (04:10 UTC next day) with ends_at = '23:30'
      const eventWithSimpleTime: Event = {
        ...mockEventBase,
        starts_at: "18:00",
        ends_at: "23:30",
        created_at: "2026-10-30T04:10:00.000Z", // Late evening Oct 29 Peru time
      };

      const originalNow = Date.now;
      try {
        // At 23:20 Peru time (04:20 UTC), event is still open
        Date.now = () => new Date("2026-10-30T04:20:00.000Z").getTime();
        expect(isEventExpired(eventWithSimpleTime)).toBe(false);

        // At 23:35 Peru time (04:35 UTC), event is expired
        Date.now = () => new Date("2026-10-30T04:35:00.000Z").getTime();
        expect(isEventExpired(eventWithSimpleTime)).toBe(true);
      } finally {
        Date.now = originalNow;
      }
    });
  });
});
