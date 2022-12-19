export const isUnsignedInt = (number: number | undefined | null) => {
  if (number === undefined || number === null) return false;

  return number >= 0;
};

export function parseIntOrNull(value: string | null | undefined) {
  if (!value) return null;

  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
}

export function parseIntOrZero(value: string | null | undefined) {
  if (!value) return 0;

  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

// ROUND TO CEILING
export function roundTotalKg(value: number) {
  if (!value) return 0;

  return Math.ceil(value);
}
