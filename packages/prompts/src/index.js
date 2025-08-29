const ANSWER_WITH_CITATIONS_SYSTEM = `You are a contract analysis assistant. Use only provided context. If no evidence, state that clearly.`;

function buildAnswerPrompt(query, contexts) {
  const ctxLines = (contexts || []).map((c, i) => `[#${i+1}] ${c.name} (score=${(c.score??0).toFixed(4)})`).join('\n');
  return `${ANSWER_WITH_CITATIONS_SYSTEM}\nQuestion: ${query}\nContext:\n${ctxLines}\nAnswer:`;
}

module.exports = { ANSWER_WITH_CITATIONS_SYSTEM, buildAnswerPrompt };
