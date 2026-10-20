const UPSTREAM = 'http://api.favorit-parts.ru/hs/hsprice/';
const ALLOWED_QUERY = ['number', 'brand', 'analogues', 'info'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = '00000000-0000-0000-0000-000000000001';
  if (!key) {
    return res.status(500).json({
      error: 'Empty key! Укажите переменную окружения FAVORIT_API_KEY в Vercel.',
    });
  }

  const search = new URLSearchParams();
  search.set('key', key);

  for (const name of ALLOWED_QUERY) {
    const value = req.query[name];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(name, String(value));
    }
  }

  const url = `${UPSTREAM}?${search.toString()}`;

  try {
    const upstream = await fetch(url, { method: req.method });
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(body);
  } catch {
    return res.status(502).json({
      error: 'Не удалось обратиться к сервису «Проценка». Повторите запрос позже.',
    });
  }
}
