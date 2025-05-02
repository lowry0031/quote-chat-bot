const http = require('http');
const fs = require('fs');
const path = require('path');

// Create api-logs directory if it doesn't exist
const API_LOGS_DIR = path.join(__dirname, 'api-logs');
if (!fs.existsSync(API_LOGS_DIR)) {
  fs.mkdirSync(API_LOGS_DIR, { recursive: true });
  console.log(`Created API logs directory: ${API_LOGS_DIR}`);
}

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Helper function to read request body
const readRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Handle API log endpoint
  if (req.method === 'POST' && req.url === '/api/log') {
    readRequestBody(req)
      .then(data => {
        const { filename, content } = data;
        
        // Validate filename to prevent directory traversal
        const sanitizedFilename = path.basename(filename);
        const filePath = path.join(API_LOGS_DIR, sanitizedFilename);
        
        // Write the file
        fs.writeFile(filePath, content, (err) => {
          if (err) {
            console.error(`Error writing log file: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          } else {
            console.log(`API log saved to: ${filePath}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              path: filePath,
              message: 'Log file saved successfully' 
            }));
          }
        });
      })
      .catch(error => {
        console.error(`Error processing request: ${error.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      });
    return;
  }
  
  // Handle static files
  let filePath = req.url === '/' ? './index.html' : '.' + req.url;
  
  // Get file extension
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('File not found');
      } else {
        // Server error
        console.error(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server`);
});
