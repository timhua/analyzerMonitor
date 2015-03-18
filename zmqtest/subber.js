var express = require('express');
var StringDecoder = require('string_decoder').StringDecoder;
var app = express();
var decoder = new StringDecoder('utf8');

var zmq = require('zmq'),
    sock = zmq.socket('sub');

sock.connect('tcp://192.168.20.220:4101');
sock.subscribe('druidLogs');
console.log('Subscriber connected to port 4101');

sock.on('message', function(topic, chunk) {
  var dataChunk = decoder.write(chunk);
  console.log('received a message related to:', String(topic), 'containing message:', dataChunk);
});

sock.on('end', function(){
  console.log('message end');
});


app.listen(4001);
console.log('listening on port 4001');
