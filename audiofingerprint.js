var http   = require('http');
var ffmpeg   = require('fluent-ffmpeg');
var fs     = require('fs');
var streamify = require('youtube-audio-stream');

// Crio um server escutando na porta 3420
http.createServer(requestListener).listen(3420);

/**
 * Pré processa o Audio, remove dados que não interessam à extração 
 * de características convertendo para o formato de 16 bits PCM, 
 * agrupando através da média os canais esquerdo e direito em 
 * uma taxa de amostragem variando de 5 a 44,1 kHz.
 *
 * @param {file} file - Stream de audio recebida da fase de escuta
 */
function preProcessing(file) {
    // Cria um stream de leitura com base no arquivo que está recebendo a musica em PCM
    var preProcStream = fs.createReadStream(file),
        pcmMono = fs.createWriteStream('pcmmono'),
        musica = '';

    preProcStream.on('data', function(chunk) {
        console.log(chunk.length);
        musica += chunk;
    });

    preProcStream.on('end', function(chunk) {
        console.log('Iniciando conversão para PCM...');
       
        console.log('Música convertida para PCM 16bits Mono');
        acoustid(__dirname + '/musicac', { key: "x5UDUVIy" }, callback);
        function callback(err, results) {
            if (err) throw err;
            // var artist = results[0].recordings[0].artists[0].name;
            console.log(results);
        }
    });
}

/**
 * Aplica uma função de janela no sinal cru pré processado, para minimizar 
 * os cálculos. Quanto maior o frame rate, mais exato fica o sistema e 
 * maior é o custo computacional.
 * 
 * @param {PCM 16bit file} file - Arquivo PCM em 16bit e um único canal
**/
function framingAndOverlap(file) {
    var preProcStream = fs.createReadStream(file),
        frameSize = 20, //milisegundos
        overlap = 50, //porcentagem
        fao = new framingAndOverlap();

    fao.size(frameSize).overlap(overlap).run(preProcStream);
    transformada(file);
}


/**
 * Converte o áudio filtrado do domínio do tempo para o domínio da frequência,
 * A próxima etapa (Extração de características) é bastante dependente da 
 * forma como os dados serão tratados aqui.
 * 
 * @param {PCM 16bit file} file - Arquivo PCM em 16bit e um único canal
**/
function transformada(file) {
  var preProcStream = fs.createReadStream(file),
      dftStream = fs.createWriteStream(__dirname + '/dft'),
      dft = new DFT(1024, 44100);
  dft.forward(preProcStream);
  var spectrum = dft.spectrum;
  spectrum.pipe(dftStream);
}
/**
 * A extração de características deve ser ajustada para a finalidade desejada do
 * audio fingerprint. No caso de reconhecimento de voz ou instrumentos,
 * os dados mais relevantes são os referentes às frequências com maior indíce de
 * repetição (harmônicas presentes). No caso de reconhecimento de músicas os
 * dados relevantes são a repetições de refrões, melodia e chroma musical.
**/
function extracao(stream) {
  var sinalfreq = fs.createReadStream(stream);

    // Análise simplificada do sinal sonoro: contando as frequencias
    // que mais se repetem (harmonicas de instrumento)
    sinalfreq.on('end', function(chunk) {
        console.log('Contando frequências do sinal e agrupando');
        var coordFN = sinalfreq;
        // Envia a contagem para o pós processamento como um vetor
        // de distância em N dimensões, sendo N o número
        // de frequências disponíveis
        posprocess(coordFN);
    });
}

/**
 * Para gerar um fingerprint o dado com as características relevantes deve 
 * ser normalizado e pode ser simplificado atraves de derivadas de 
 * primeira e segunda ordem.
**/
function posprocess(coords) {
  var maxFreq = -11000,
      minFreq = 11000;
   for(int i=0;i<coords.length;i++) {
       if(coords[i]<minFreq) {
           minFreq = coords[i];
       }
       if(coords[i]>maxFreq) {
           maxFreq = coords[i];
       }
   }
   var amplitude = maxFreq - minFreq,
       intervalo = amplitude/36; //26 letras e 10 numeros
    // Normalizando o sinal para 36 representações
    for(int i=0;i<coords.length;i++) {
        coords[i] = Math.round(coords[i]/intervalo);
    }
    modeling(coords);
}

/**
 * A modelagem do fingerprint usualmente recebe uma sequência de vetores de
 * características. Através desse vetor é gerado um hash de identificação.
**/
function modeling(coords) {
    var simbolos = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
         "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
         "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        hash = ""';
    for(int i=0;i<coords.length;i++) {
        hash = hash + simbolos[coords[i]];
    }
    console.log('Hash de identificação:');
    console.log(hash);
}
