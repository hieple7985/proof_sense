export const config = {
  port: Number(process.env.PORT || 3001),
  ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
};
