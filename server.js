var http   = require('http');
var fs     = require('fs');
var stream = require('youtube-audio-stream');

http.createServer(demo).listen(3420);

function demo(req, res) {
  if (req.url === '/') {
    return fs.createReadStream(__dirname + '/server.html').pipe(res);
  }
  if (/youtube/.test(req.url)) {
    stream(req.url.slice(1)).pipe(res);
  }
}

console.log('Acende e relaxa  http://localhost:3420');
