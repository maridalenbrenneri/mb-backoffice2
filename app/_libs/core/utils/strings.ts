export function nullIfEmptyOrWhitespace(value: string | null | undefined) {
  if (!value) return null;
  if (!value.trim().length) return null;

  return value.trim();
}
