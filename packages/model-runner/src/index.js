// Use node-fetch for Node.js compatibility
let fetch;
try {
  fetch = globalThis.fetch || require('node-fetch');
} catch {
  // Fallback for older Node.js versions
  fetch = require('node-fetch');
}

async function pingOllama(host = 'http://127.0.0.1:11434') {
  const res = await fetch(`${host}/api/tags`).catch(() => null);
  if (!res || !res.ok) return { ok: false };
  const data = await res.json().catch(() => ({}));
  return { ok: true, data };
}

async function generateOllama(params) {
  const host = (params && params.host) || 'http://127.0.0.1:11434';
  const model = params.model;
  const prompt = params.prompt;
  console.log(`[model-runner] Calling ${host}/api/generate with model=${model}`);
  const res = await fetch(`${host}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false })
  }).catch((err) => {
    console.error('[model-runner] Fetch error:', err);
    return null;
  });
  if (!res || !res.ok) {
    console.error('[model-runner] Response error:', res?.status, res?.statusText);
    return { ok: false };
  }
  const data = await res.json().catch((err) => {
    console.error('[model-runner] JSON parse error:', err);
    return {};
  });
  console.log('[model-runner] Success:', data.response?.substring(0, 100));
  return { ok: true, data };
}

module.exports = { pingOllama, generateOllama };
