var express = require('express');
var StringDecoder = require('string_decoder').StringDecoder;
var app = express();
var decoder = new StringDecoder('utf8');

var zmq = require('zmq'),
    sock = zmq.socket('sub');

// sock.connect('tcp://192.168.20.220:4101');     //peavy
sock.connect('tcp://127.0.0.1:10250');            //localhost
// sock.connect('tcp://192.168.20.250:10250');       //sogard
sock.subscribe('');
console.log('Subscriber connected to port 11220');

sock.on('message', function(topic, chunk) {
  var dataChunk = decoder.write(chunk);
  console.log('containing message:', dataChunk);
});

app.listen(4001);
console.log('listening on port 4001');
