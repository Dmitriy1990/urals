/**
 * Локальная разработка (vite): ключ передаётся из VITE_FAVORIT_API_KEY.
 * Production (Vercel): ключ только на сервере — см. api/price.js и FAVORIT_API_KEY.
 */
export const API_KEY =
  import.meta.env.VITE_FAVORIT_API_KEY ||
  '00000000-0000-0000-0000-000000000001';

/** Относительный путь: dev — proxy Vite, prod — serverless /api/price */
export const API_BASE = '/api/price';

export const USE_CLIENT_API_KEY = import.meta.env.DEV;
