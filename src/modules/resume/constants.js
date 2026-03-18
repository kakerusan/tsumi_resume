export const STORAGE_KEY = 'resume-builder-draft-v1'
export const PANELS_STORAGE_KEY = 'resume-builder-panels-v1'
export const SCHEMA_VERSION = 6

export const PHOTO_RULES = {
  MAX_BYTES: 5 * 1024 * 1024,
  MAX_EDGE: 900,
  PRIMARY_QUALITY: 0.82,
  SECONDARY_QUALITY: 0.72,
  SUPPORTED_TYPES: new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
}
