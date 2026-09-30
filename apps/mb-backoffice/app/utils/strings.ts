export function nullIfEmptyOrWhitespace(value: string | null | undefined) {
  if (!value) return null;
  if (!value.trim().length) return null;

  return value.trim();
}

// Returns true if a string is null or empty or only contains whitespace
export function isStringNullOrEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}
