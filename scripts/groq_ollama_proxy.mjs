// Minimal Ollama-compatible proxy that forwards to Groq's OpenAI-compatible API
// Endpoints exposed:
//  - GET  /api/tags        -> { models: [{ name: 'gpt-oss:20b' }] }
//  - POST /api/generate    -> { response: "..." }
// Usage:
//   export GROQ_API_KEY=... 
//   node 3_dev/proof_sense/scripts/groq_ollama_proxy.mjs
// Optional env:
//   SHIM_PORT (default 11434)
//   SHIM_BIND (default 127.0.0.1)

import http from 'http';

const PORT = Number(process.env.SHIM_PORT || 11434);
const HOST = process.env.SHIM_BIND || '127.0.0.1';
const API_KEY = process.env.GROQ_API_KEY || '';

if (!API_KEY) {
  console.error('[groq-proxy] Missing GROQ_API_KEY environment variable');
  process.exit(1);
}

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body)
  });
  res.end(body);
}

function mapModel(model) {
  if (!model || model === 'gpt-oss:20b') return 'openai/gpt-oss-20b';
  return model; // allow passing full id directly
}

async function handleGenerate(req, res) {
  try {
    let buf = '';
    for await (const chunk of req) buf += chunk;
    let payload = {};
    try { payload = buf ? JSON.parse(buf) : {}; } catch {}

    const model = mapModel(payload.model);
    const prompt = String(payload.prompt ?? '');

    const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        stream: false
      })
    }).catch(err => {
      console.error('[groq-proxy] fetch error:', err);
      return null;
    });

    if (!groqResp || !groqResp.ok) {
      const text = groqResp ? await groqResp.text().catch(() => '') : '';
      console.error('[groq-proxy] groq error:', groqResp?.status, groqResp?.statusText, text);
      return json(res, 500, { ok: false, error: 'groq_request_failed' });
    }

    const data = await groqResp.json().catch(() => ({}));
    const content = data?.choices?.[0]?.message?.content ?? '';
    // Return in Ollama-compatible shape
    return json(res, 200, { response: content });
  } catch (e) {
    console.error('[groq-proxy] generate handler error:', e);
    return json(res, 500, { ok: false, error: 'proxy_error' });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/api/tags') {
    return json(res, 200, { models: [{ name: 'gpt-oss:20b' }] });
  }
  if (req.method === 'POST' && url.pathname === '/api/generate') {
    return handleGenerate(req, res);
  }
  // Fallback
  json(res, 404, { error: 'not_found' });
});

server.listen(PORT, HOST, () => {
  console.log(`[groq-ollama-proxy] listening on http://${HOST}:${PORT}`);
  console.log(`[groq-ollama-proxy] advertising model tag: gpt-oss:20b -> maps to Groq: openai/gpt-oss-20b`);
});

