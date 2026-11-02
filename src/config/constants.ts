/**
 * Domain & Business Logic Constants
 */

// DNI format rules
export const DNI_LENGTH = 8;
export const DNI_REGEX = /^\d{8}$/;

// Geolocation & Distance (Haversine Earth radius)
export const EARTH_RADIUS_METERS = 6_371_000;

// Maximum allowed GPS inaccuracy (accuracy in meters) accepted without warning
// If browser accuracy is higher than 150m, it usually indicates cell tower or low-precision Wi-Fi fallback.
export const MAX_REASONABLE_ACCURACY_METERS = 150;
// Maximum GPS uncertainty buffer added to event radius to accommodate indoor/attenuated signals
export const GPS_TOLERANCE_BUFFER_METERS = 50;

// Event coverage radius parameters
export const DEFAULT_RADIUS_METERS = 100;
export const MIN_RADIUS_METERS = 10;
export const MAX_RADIUS_METERS = 5000;

// User management rules
export const SUPER_ADMIN_IDENTIFIER = "00000000";
export const MIN_PASSWORD_LENGTH = 6;
export const MIN_FULL_NAME_LENGTH = 3;

// Pagination
export const DEFAULT_PAGE_LIMIT = 25;
export const MAX_PAGE_LIMIT = 100;

// Event code generation
export const EVENT_CODE_PREFIX = "ev-";
export const EVENT_CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";
export const EVENT_CODE_RANDOM_LENGTH = 6;
