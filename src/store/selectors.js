import { createSelector } from '@reduxjs/toolkit';

const selectOffers = (state) => state.parts.offers;
const selectOffersFilter = (state) => state.parts.offersFilter;
const selectBrands = (state) => state.parts.brands;
const selectBrandFilter = (state) => state.parts.brandFilter;

function sortOffers(list, sort) {
  const copy = [...list];
  switch (sort) {
    case 'price-desc':
      return copy.sort((a, b) => (b.price ?? Infinity) - (a.price ?? Infinity));
    case 'stock-desc':
      return copy.sort((a, b) => b.stock - a.stock || (a.price ?? Infinity) - (b.price ?? Infinity));
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    case 'price-asc':
    default:
      return copy.sort(
        (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || b.stock - a.stock,
      );
  }
}

export const selectDisplayOffers = createSelector(
  [selectOffers, selectOffersFilter],
  (offers, filter) => {
    let list = offers;
    if (filter.inStockOnly) {
      list = list.filter((row) => row.stock > 0);
    }
    const query = filter.query.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (row) =>
          row.name.toLowerCase().includes(query) ||
          row.brand.toLowerCase().includes(query) ||
          row.number.toLowerCase().includes(query),
      );
    }
    return sortOffers(list, filter.sort);
  },
);

export const selectDisplayBrands = createSelector(
  [selectBrands, selectBrandFilter],
  (brands, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (item) =>
        item.brand.toLowerCase().includes(q) ||
        (item.sampleName && item.sampleName.toLowerCase().includes(q)),
    );
  },
);
