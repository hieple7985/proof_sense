function chunkText(text, size = 800, overlap = 120) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}

function cosineSim(a, b) {
  let dot = 0, as = 0, bs = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; as += a[i]*a[i]; bs += b[i]*b[i]; }
  return dot / (Math.sqrt(as) * Math.sqrt(bs) + 1e-8);
}

// Simple hashing-based embedding (bag-of-words into fixed 128-dim)
function embedText(text, dim = 128) {
  const vec = new Array(dim).fill(0);
  const tokens = (text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const tok of tokens) {
    let h = 2166136261;
    for (let i = 0; i < tok.length; i++) h = (h ^ tok.charCodeAt(i)) * 16777619 >>> 0;
    vec[h % dim] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v*v, 0)) + 1e-8;
  return vec.map(v => v / norm);
}

module.exports = { chunkText, cosineSim, embedText };
