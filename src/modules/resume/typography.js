export const DEFAULT_NAME_FONT_SIZE = 18
export const DEFAULT_SCHOOL_FONT_SIZE = 13

export const NAME_FONT_SIZE_MIN = 14
export const NAME_FONT_SIZE_MAX = 32

export const SCHOOL_FONT_SIZE_MIN = 11
export const SCHOOL_FONT_SIZE_MAX = 22

function clampSize(value, min, max, fallback) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.round(parsed * 10) / 10))
}

export function clampNameFontSize(value, fallback = DEFAULT_NAME_FONT_SIZE) {
  return clampSize(value, NAME_FONT_SIZE_MIN, NAME_FONT_SIZE_MAX, fallback)
}

export function clampSchoolFontSize(value, fallback = DEFAULT_SCHOOL_FONT_SIZE) {
  return clampSize(value, SCHOOL_FONT_SIZE_MIN, SCHOOL_FONT_SIZE_MAX, fallback)
}
