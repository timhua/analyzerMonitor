  var zmq = require('zmq'),
      sock = zmq.socket('pub');

var ZeroMQ = {
  connect: function(hostIP, zmqPort){
    // initialize ZeroMQ sync
    sock.bindSync('tcp://127.0.0.1:' + zmqPort);

    console.log('Publisher bound to port ', zmqPort);
  },

  sock: sock
};

module.exports = ZeroMQ;
