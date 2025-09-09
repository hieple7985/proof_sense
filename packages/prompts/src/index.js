const ANSWER_WITH_CITATIONS_SYSTEM = `You are a contract analysis assistant. Answer questions based ONLY on the provided context. If the context contains relevant information, provide a clear, direct answer. If no relevant information is found, state "No evidence found in the provided documents."`;

function buildAnswerPrompt(query, contexts) {
  const ctxLines = (contexts || []).map((c, i) => `[Document ${i+1}: ${c.name}]\nContent: ${c.text || 'No content available'}\nRelevance Score: ${(c.score??0).toFixed(4)}`).join('\n\n');
  return `${ANSWER_WITH_CITATIONS_SYSTEM}

Question: ${query}

Context Documents:
${ctxLines}

Instructions: Based on the context above, provide a direct answer to the question. Quote specific text from the documents when possible.

Answer:`;
}

module.exports = { ANSWER_WITH_CITATIONS_SYSTEM, buildAnswerPrompt };
