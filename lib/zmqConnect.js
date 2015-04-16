var zmq = require('zmq');

// initialize ZeroMQ sync
var ZeroMQ = function(hostIP, zmqPort, type){
  var sock = zmq.socket('pub');
  sock.bindSync('tcp://'+hostIP + ':' + zmqPort);
  console.log(type, 'monitor bound to',hostIP + ":", zmqPort);
  return sock;
};

module.exports = ZeroMQ;
