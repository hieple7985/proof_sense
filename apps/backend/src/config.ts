export const config = {
  port: Number(process.env.PORT || 3001),
  ollamaHost: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
};
