export async function pingOllama(host: string = 'http://localhost:11434') {
  const res = await fetch(`${host}/api/tags`).catch(() => null);
  if (!res || !res.ok) return { ok: false };
  const data = await res.json().catch(() => ({}));
  return { ok: true, data };
}
