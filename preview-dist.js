const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'dist');
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safePath = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
  let filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    send(res, 403, 'forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stat) => {
    if (!statErr && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        send(res, 404, 'not found');
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      send(res, 200, data, mimeTypes[extension] || 'application/octet-stream');
    });
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Kuroclean local preview running at http://127.0.0.1:${port}`);
});
