  var zmq = require('zmq'),
      sock = zmq.socket('pub');

var ZeroMQ = {
  connect: function(hostIP, zmqPort){
    // initialize ZeroMQ sync
    sock.bindSync(hostIP + ':' + zmqPort);

    console.log('Publisher bound to',hostIP + ":", zmqPort);
  },

  sock: sock
};

module.exports = ZeroMQ;
