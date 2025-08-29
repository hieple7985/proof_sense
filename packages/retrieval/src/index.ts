export function chunkText(text: string, size = 800, overlap = 120) {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}

export function cosineSim(a: number[], b: number[]) {
  let dot = 0, as = 0, bs = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; as += a[i]*a[i]; bs += b[i]*b[i]; }
  return dot / (Math.sqrt(as) * Math.sqrt(bs) + 1e-8);
}
