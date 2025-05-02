const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

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
        if (!body) {
          resolve({});
          return;
        }
        
        // Check content type to determine how to parse the body
        const contentType = req.headers['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          // Parse as JSON
          resolve(JSON.parse(body));
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          // Parse as form data
          const formData = {};
          body.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            formData[decodeURIComponent(key)] = decodeURIComponent(value || '');
          });
          resolve(formData);
        } else {
          // For other content types, just return the raw body
          resolve({ rawBody: body });
        }
      } catch (error) {
        console.error('Error parsing request body:', error);
        // Return raw body on parsing error
        resolve({ rawBody: body });
      }
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
};

// Helper function to proxy requests to the MaidCentral API
const proxyRequest = (req, res, targetUrl) => {
  readRequestBody(req)
    .then(body => {
      const parsedUrl = url.parse(targetUrl);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.path,
        method: req.method,
        headers: {
          ...req.headers,
          host: parsedUrl.hostname
        }
      };

      // Remove headers that might cause issues
      delete options.headers['host'];
      delete options.headers['content-length'];

      const proxyReq = https.request(options, (proxyRes) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Copy status code and headers from the proxied response
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        // Pipe the response data
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (error) => {
        console.error(`Proxy request error: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      });

      // Write request body based on content type
      const contentType = req.headers['content-type'] || '';
      
      if (body) {
        if (contentType.includes('application/json')) {
          // For JSON data
          proxyReq.write(JSON.stringify(body));
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          // For form data
          if (body.rawBody) {
            // If we have the raw body, use it directly
            proxyReq.write(body.rawBody);
          } else {
            // Otherwise, convert the object back to form data
            const formData = Object.entries(body)
              .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
              .join('&');
            proxyReq.write(formData);
          }
        } else if (body.rawBody) {
          // For other content types with raw body
          proxyReq.write(body.rawBody);
        }
      }

      proxyReq.end();
    })
    .catch(error => {
      console.error(`Error processing request body: ${error.message}`);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    });
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(204);
    res.end();
    return;
  }
  
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
  
  // Proxy requests to the MaidCentral API
  if (req.url.startsWith('/proxy/api/')) {
    const targetUrl = 'https://api.maidcentral.net' + req.url.substring('/proxy/api'.length);
    proxyRequest(req, res, targetUrl);
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
  console.log(`API proxy available at http://localhost:${PORT}/proxy/api/`);
  console.log(`Press Ctrl+C to stop the server`);
});
