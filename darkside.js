var youtubeStream = require('youtube-audio-stream');

var getAudio = function(req, res) {
 
  var requestUrl = 'http://youtube.com/watch?v=' + req.params.videoId;
 
  try {
    youtubeStream(requestUrl).pipe(res);
  } catch(exception) {
    res.status(500).send(exception);
  }
 
};
