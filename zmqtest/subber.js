var express = require('express');
var StringDecoder = require('string_decoder').StringDecoder;
var app = express();
var decoder = new StringDecoder('utf8');

var zmq = require('zmq'),
    sock = zmq.socket('sub');

// sock.connect('tcp://192.168.20.220:4101');     //peavy
<<<<<<< HEAD
sock.connect('tcp://127.0.0.1:10250');            //localhost
// sock.connect('tcp://192.168.20.250:10250');       //sogard
sock.subscribe('');
=======
sock.connect('tcp://10.178.158.212:6557');            //localhost
// sock.connect('tcp://192.168.20.250:10250');       //sogard
sock.subscribe('points_100ms');
>>>>>>> f379873f419a86fcc8f94a0a55e5d6d1e226e8c3
console.log('Subscriber connected to port 11220');

sock.on('message', function(topic, chunk) {
  var dataChunk = decoder.write(chunk);
  console.log('containing message:', dataChunk);
});

app.listen(4001);
console.log('listening on port 4001');
