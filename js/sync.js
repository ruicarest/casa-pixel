// Cloud copy of the house (Supabase). Plain fetch, no library, so it also runs on old Safari.
// The server functions are in supabase/schema.sql; Siri Shortcuts call the same API.
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const CODE_KEY = 'casa-pixel:code';

export function getCode() {
  try { return localStorage.getItem(CODE_KEY) || ''; } catch { return ''; }
}
export function setCode(code) {
  try { code ? localStorage.setItem(CODE_KEY, code) : localStorage.removeItem(CODE_KEY); } catch { /* ignore */ }
}

// A link like https://…/#casa=CODE sets the device up in one tap; the code is then removed from the address bar.
export function takeCodeFromUrl() {
  const m = /[#&]casa=([\w-]+)/.exec(location.hash);
  if (!m) return false;
  setCode(m[1]);
  history.replaceState(null, '', location.pathname + location.search);
  return true;
}

async function rpc(fn, args) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`${fn}: HTTP ${res.status}`);
  return res.json();
}

// -> { objects, at } or null when the code does not match any house
export async function pull(code) {
  const r = await rpc('casa_get', { p_secret: code });
  return r ? { objects: r.objects, at: Date.parse(r.updated_at) } : null;
}

// -> the new timestamp, or null when the code does not match any house
export async function push(code, objects) {
  const ts = await rpc('casa_put', { p_secret: code, p_objects: objects });
  return ts ? Date.parse(ts) : null;
}
