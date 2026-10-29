/**
 * Typed environment variables configuration with safe fallbacks
 */

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
  DATABASE_PATH: process.env.DATABASE_PATH || "data.sqlite",
  JWT_SECRET: process.env.JWT_SECRET || "bandera-asistencia-secret-key-2026-production",
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || "auth_session",
  SESSION_MAX_AGE_SECONDS: Number(process.env.SESSION_MAX_AGE_SECONDS) || 28800, // 8 hours
  NOMINATIM_USER_AGENT: process.env.NOMINATIM_USER_AGENT || "BanderaAsistencia/1.0 (asistencia@bandera.pe)",
  AUTO_SEED: process.env.AUTO_SEED === "true",
};
