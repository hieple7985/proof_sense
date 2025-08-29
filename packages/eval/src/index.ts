export function evaluateCitationCoverage(text: string) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const withBrackets = sentences.filter(s => /\[\d+\]/.test(s)).length;
  return { total: sentences.length, covered: withBrackets, ratio: sentences.length ? withBrackets / sentences.length : 0 };
}
