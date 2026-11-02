// Ca//andra.OS — última base subida por casilla (ma, se, crm)
// GET /api/file?slot=ma   -> el archivo original (xlsx/csv)
// PUT /api/file?slot=ma   -> guarda el archivo (body binario, máx. ~4 MB)
import { get, put } from '@vercel/blob';

const SLOTS = new Set(['ma', 'se', 'crm']);
const ACCESS = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';
const MAX_BYTES = 4 * 1024 * 1024;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

export async function GET(request) {
  try {
    const slot = new URL(request.url).searchParams.get('slot');
    if (!SLOTS.has(slot)) return json({ error: 'slot inválido' }, 400);
    const res = await get(`files/${slot}.bin`, { access: ACCESS, useCache: false });
    if (!res || res.statusCode !== 200 || !res.stream) return json({ error: 'sin archivo' }, 404);
    return new Response(res.stream, {
      status: 200,
      headers: { 'content-type': 'application/octet-stream', 'cache-control': 'no-store' }
    });
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 500);
  }
}

export async function PUT(request) {
  try {
    const slot = new URL(request.url).searchParams.get('slot');
    if (!SLOTS.has(slot)) return json({ error: 'slot inválido' }, 400);
    const buf = await request.arrayBuffer();
    if (!buf.byteLength) return json({ error: 'archivo vacío' }, 400);
    if (buf.byteLength > MAX_BYTES) return json({ error: 'El archivo supera 4 MB' }, 413);
    await put(`files/${slot}.bin`, Buffer.from(buf), {
      access: ACCESS,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/octet-stream',
      cacheControlMaxAge: 60
    });
    return json({ ok: true, size: buf.byteLength });
  } catch (err) {
    return json({ error: String(err && err.message || err) }, 500);
  }
}
