var http   = require('http');
var ffmpeg   = require('fluent-ffmpeg');
var fs     = require('fs');
var streamify = require('youtube-audio-stream');
var through  = require('through2');
var DFT = require('digitalsignals');
// Crio um server escutando na porta 3420
http.createServer(requestListener).listen(3420);


// request e response do audio cru
function requestListener(req, res) {
  if (req.url === '/') {
    return fs.createReadStream(__dirname + '/server.html').pipe(res);
  }
  if (/youtube/.test(req.url)) {
    var opt = {
      file: __dirname + '/pcmraws16le'
    };
    streamify(req.url.slice(1),opt);
    transformada(__dirname + '/pcmraws16le');
  }
}
function recorderProcess(e) {
  var left = e.inputBuffer.getChannelData(0);
}

function preProcessing(file) {
  /*var preProcStream = fs.createReadStream(file),
      musica = '';

  preProcStream.on('data', function(chunk) {
    console.log(chunk.length);
    musica += chunk;
  });

  preProcStream.on('end', function(chunk) {
    console.log(musica);
    unzipper = new pcmUtils.Unzipper(2, pcmUtils.FMT_S16LE);

    musica.pipe(unzipper);
    // Mix dos canais direito e esquerdo
    unzipper.left.pipe(mixer.left);
    unzipper.right.pipe(mixer.right);
    mixer.pipe(process.stderr);
  });*/
}

function transformada(file) {
  var preProcStream = fs.createReadStream(file),
      dftStream = fs.createWriteStream(__dirname + '/dft'),
      dft = new DFT(1024, 44100);
  dft.forward(preProcStream);
  var spectrum = dft.spectrum;
  spectrum.pipe(dftStream);
}

console.log('Acende e relaxa  http://localhost:3420');
