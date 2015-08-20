let http = require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
let argv = require('yargs')
  .default('host', '127.0.0.1')
  .argv

let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme + argv.host + ':' + port
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

// Echo Server
http.createServer((req, res) => {
  console.log(`Request received at: ${req.url}`)
  req.pipe(res)

  for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
  }
}).listen(8000)

http.createServer((req, res) => {

  if (req.headers['x-destination-url']) {
    destinationUrl = req.headers['x-destination-url']
  }

  // Logging
  logStream.write('Request headers: ' + JSON.stringify(req.headers))
  console.log(`Proxying request to: ${destinationUrl + req.url}`)

  // Proxy code
  let options = {
    headers: req.headers,
    url: `${destinationUrl}${req.url}`
  }
  options.method = req.method

  // Log response
  let downstreamResponse = req.pipe(request(options))
  process.stdout.write(JSON.stringify(downstreamResponse.headers))
  downstreamResponse.pipe(logStream, {end: false})
  downstreamResponse.pipe(res)
}).listen(8001)
