const http = require('http');

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('ProofSense backend minimal server (CJS)');
});

server.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
});
