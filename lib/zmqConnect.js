  var zmq = require('zmq'),
      sock = zmq.socket('pub');

var ZeroMQ = {
  connect: function(hostIP, zmqPort){
    // initialize ZeroMQ sync
    sock.bindSync('tcp://'+hostIP + ':' + zmqPort);

    console.log('Publisher bound to',hostIP + ":", zmqPort);

    return sock;
  },

  sock: sock
};

module.exports = ZeroMQ;
