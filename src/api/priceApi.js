import { API_BASE, API_KEY, USE_CLIENT_API_KEY } from '../config';

function buildUrl(params) {
  const search = new URLSearchParams();

  search.set('key', API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  return `${API_BASE}?${search.toString()}`;
}

function isEmptyGood(item) {
  if (!item || typeof item !== 'object') return true;
  return !item.goodsID && !item.brand && !item.number && !item.name;
}

export function warehouseSummary(warehouses) {
  if (!Array.isArray(warehouses) || warehouses.length === 0) {
    return { price: null, stock: 0 };
  }
  let stock = 0;
  let bestPrice = null;
  for (const wh of warehouses) {
    const whStock = Number(wh.stock) || 0;
    stock += whStock;
    const whPrice = Number(wh.price);
    if (whStock > 0 && !Number.isNaN(whPrice)) {
      if (bestPrice === null || whPrice < bestPrice) {
        bestPrice = whPrice;
      }
    }
  }
  if (bestPrice === null) {
    const firstPrice = Number(warehouses[0]?.price);
    bestPrice = Number.isNaN(firstPrice) ? null : firstPrice;
  }
  return { price: bestPrice, stock };
}

export async function fetchPrice(params, signal) {
  const url = buildUrl(params);
  let response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw err;
    }
    throw new Error('Не удалось выполнить запрос. Проверьте подключение к сети.');
  }

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Некорректный ответ сервера.');
  }

  if (data && typeof data.error === 'string' && data.error.trim()) {
    throw new Error(data.error.trim());
  }

  const goods = Array.isArray(data?.goods) ? data.goods.filter((g) => !isEmptyGood(g)) : [];
  return goods;
}

export function fetchBrandsByNumber(number, signal) {
  return fetchPrice({ number }, signal);
}

export function fetchAnalogues(number, brand, signal) {
  return fetchPrice({ number, brand, analogues: 'on', info: 'on' }, signal);
}

export function flattenAnalogueOffers(goodsList) {
  const rows = [];
  let index = 0;
  for (const item of goodsList) {
    const analogues = Array.isArray(item.analogues) ? item.analogues : [];
    if (analogues.length > 0) {
      for (const analog of analogues) {
        rows.push(normalizeRow(analog, index));
        index += 1;
      }
    } else {
      rows.push(normalizeRow(item, index));
      index += 1;
    }
  }
  return rows;
}

function normalizeRow(item, index) {
  const { price, stock } = warehouseSummary(item.warehouses);
  const fallbackStock = Number(item.count);
  return {
    id: item.goodsID ? `${item.goodsID}-${index}` : `${item.brand}-${item.number}-${index}`,
    brand: item.brand || '—',
    number: item.number || '',
    name: item.name || '—',
    price,
    stock: stock || (Number.isNaN(fallbackStock) ? 0 : fallbackStock),
    notRefund: Boolean(item.notRefund),
  };
}

export function groupBrands(goodsList) {
  const map = new Map();
  for (const item of goodsList) {
    const brand = (item.brand || '').trim();
    if (!brand) continue;
    const { price, stock } = warehouseSummary(item.warehouses);
    const fallbackStock = Number(item.count);
    const totalStock = stock || (Number.isNaN(fallbackStock) ? 0 : fallbackStock);
    const existing = map.get(brand);
    if (!existing) {
      map.set(brand, {
        brand,
        sampleName: item.name || '',
        minPrice: price,
        totalStock,
        count: 1,
      });
    } else {
      existing.count += 1;
      existing.totalStock += totalStock;
      if (price !== null && (existing.minPrice === null || price < existing.minPrice)) {
        existing.minPrice = price;
      }
    }
  }
  return [...map.values()].sort((a, b) => a.brand.localeCompare(b, 'ru'));
}
