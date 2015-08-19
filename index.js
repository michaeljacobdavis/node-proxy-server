let http = require('http');
let request = require('request');

// Echo Server
http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`);
    req.pipe(res);
    for (let header in req.headers) {
      res.setHeader(header, req.headers[header]);
    }
}).listen(8000)

let destinationUrl = '127.0.0.1:8000';

http.createServer((req, res) => {
  console.log(`Proxying request to: ${destinationUrl + req.url}`)
  // Proxy code
    let options = {
        headers: req.headers,
        url: `http://${destinationUrl}${req.url}`
    };
    options.method = req.method;
    req.pipe(request(options)).pipe(res);
}).listen(8001)
