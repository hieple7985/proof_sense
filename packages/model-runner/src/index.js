async function pingOllama(host = 'http://localhost:11434') {
  const res = await fetch(`${host}/api/tags`).catch(() => null);
  if (!res || !res.ok) return { ok: false };
  const data = await res.json().catch(() => ({}));
  return { ok: true, data };
}

async function generateOllama(params) {
  const host = (params && params.host) || 'http://localhost:11434';
  const model = params.model;
  const prompt = params.prompt;
  const res = await fetch(`${host}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false })
  }).catch(() => null);
  if (!res || !res.ok) return { ok: false };
  const data = await res.json().catch(() => ({}));
  return { ok: true, data };
}

module.exports = { pingOllama, generateOllama };
