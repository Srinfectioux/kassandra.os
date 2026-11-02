// Ca//andra.OS — estado compartido (Calendario, Seguimiento, Gestor, registro de bases)
// GET  /api/state?keys=a,b,c  -> { a: {...} | null, b: ..., c: ... }
// PUT  /api/state?key=a       -> guarda el JSON del body
import { get, put } from '@vercel/blob';

const KEYS = new Set(['pendientes', 'seguimiento', 'gestor', 'files']);
const ACCESS = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';
const MAX_BYTES = 2 * 1024 * 1024;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

async function readKey(key) {
  const res = await get(`state/${key}.json`, { access: ACCESS, useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  const text = await new Response(res.stream).text();
  try { return JSON.parse(text); } catch { return null; }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const keys = (url.searchParams.get('keys') || '').split(',').map(s => s.trim()).filter(k => KEYS.has(k));
    if (!keys.length) return json({ error: 'keys inválidas' }, 400);
    const out = {};
    await Promise.all(keys.map(async k => { out[k] = await readKey(k); }));
    return json(out);
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 500);
  }
}

export async function PUT(request) {
  try {
    const key = new URL(request.url).searchParams.get('key');
    if (!KEYS.has(key)) return json({ error: 'key inválida' }, 400);
    const body = await request.text();
    if (body.length > MAX_BYTES) return json({ error: 'demasiado grande' }, 413);
    const data = JSON.parse(body);
    if (!data || typeof data !== 'object') return json({ error: 'JSON inválido' }, 400);
    await put(`state/${key}.json`, JSON.stringify(data), {
      access: ACCESS,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60
    });
    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 500);
  }
}
