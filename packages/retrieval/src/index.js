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

module.exports = { chunkText, cosineSim };
