const http = require('http');
const server = http.createServer((req, res) => {
  console.log('Request received:', req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
});
server.listen(4010, '127.0.0.1', () => {
  console.log('Server listening on 4010');
});
