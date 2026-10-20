const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

export function formatPrice(price) {
  if (price === null || price === undefined) return '—';
  return priceFormatter.format(price);
}
