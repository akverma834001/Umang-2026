const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const DIST_DIR = path.join(__dirname, 'frontend', 'dist');
const BACKEND_PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Spawn Python FastAPI backend if Python is present
let backendProcess = null;
const pythonCandidates = [process.env.PYTHON_BIN, 'python3', 'python'].filter(Boolean);

function startBackend() {
  for (const py of pythonCandidates) {
    try {
      const proc = spawn(
        py,
        ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', String(BACKEND_PORT)],
        { cwd: __dirname, stdio: 'inherit' }
      );
      proc.on('error', (err) => {
        console.warn(`[Server] Could not spawn backend with '${py}': ${err.message}`);
      });
      backendProcess = proc;
      console.log(`[Server] Spawned FastAPI backend via ${py} on port ${BACKEND_PORT}`);
      break;
    } catch {
      // Try next candidate
    }
  }
}

// Proxy API requests to backend
function proxyRequest(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxy = http.request(options, (targetRes) => {
    res.writeHead(targetRes.statusCode, targetRes.headers);
    targetRes.pipe(res, { end: true });
  });

  proxy.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend API unavailable or starting up.' }));
  });

  req.pipe(proxy, { end: true });
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // 1. API proxying
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return proxyRequest(req, res);
  }

  // 2. Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', service: 'SBU UMANG Unified Platform' }));
  }

  // 3. Static asset resolution
  let filePath = path.join(DIST_DIR, pathname);
  
  // Guard against directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      return fs.createReadStream(filePath).pipe(res);
    }

    // 4. SPA Fallback: serve index.html for all client-side routes
    const indexPath = path.join(DIST_DIR, 'index.html');
    fs.readFile(indexPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Frontend dist not found. Please run "npm run build" first.');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
  });
});

startBackend();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] SBU UMANG unified platform running at http://0.0.0.0:${PORT}`);
});

process.on('SIGINT', () => {
  if (backendProcess) backendProcess.kill();
  process.exit(0);
});
process.on('SIGTERM', () => {
  if (backendProcess) backendProcess.kill();
  process.exit(0);
});

