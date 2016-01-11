var http   = require('http');
var ffmpeg   = require('fluent-ffmpeg');
var fs     = require('fs');
var streamify = require('youtube-audio-stream');
var fpcalc = require("fpcalc");
var acoustid = require("acoustid");

// Crio um server escutando na porta 3420
http.createServer(requestListener).listen(3420);

/**
 * Trata request inicial e escuta o audio que
 * será enviado para a primeira etapa.
 */
function requestListener(req, res) {
    if (req.url === '/') {
        return fs.createReadStream(__dirname + '/server.html')
        .pipe(res);
    }
    if (/youtube/.test(req.url)) {
        var opt = {
            file: __dirname + '/musica'
        };

        streamify(req.url.slice(1)).pipe(res);
        streamify(req.url.slice(1),opt)
        .on('pipe', function() {
            console.log('Calculando Chromaprint...');
        })
        .on('finish', function() {
            console.log('acabou o stream');
            fpcalc( __dirname + '/musica', function(err, result) {
                if (err) throw err;
                console.log('Duração da música: ');
                console.log(result.duration+' segundos');
                console.log('Audio Fingerprint: ');
                console.log(result.fingerprint);
            });
            acoustid(__dirname + '/musica', { key: "x5UDUVIy" }, callback);
            function callback(err, results) {
                console.log("Consultando Banco de dados...");
                if (err) throw err;
                var title = results[0].recordings[0].title;
                var appearOn = results[0].recordings[0].releasegroups[0].title;
                var artist = results[0].recordings[0].artists[0].name;
                console.log("Música encontrada!");
                console.log('Titulo: '+title);
                console.log('Artista: '+artist);
                console.log('aparece em: '+appearOn);
            }
        });
    }
}


console.log('Servidor executando em  http://localhost:3420');
