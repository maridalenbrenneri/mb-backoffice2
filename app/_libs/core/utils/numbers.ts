export const isUnsignedInt = (number: number | undefined | null) => {
  if (number === undefined || number === null) return false;

  return number >= 0;
};
