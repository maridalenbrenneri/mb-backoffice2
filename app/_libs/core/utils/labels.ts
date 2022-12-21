export function coffeeVariationToLabel(variation: string) {
  switch (variation) {
    case '_250':
      return '250gr';
    case '_500':
      return '500gr';
    case '_1200':
      return '1,2kg';
    default:
      return variation;
  }
}

export function deliveryDayTypeToLabel(type: string) {
  switch (type) {
    case 'NORMAL':
      return 'Normal';
    case 'MONTHLY':
      return 'Monthly';
    case 'MONTHLY_3RD':
      return 'Monthly 3rd';
    default:
      return type;
  }
}
