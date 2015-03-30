  var zmq = require('zmq'),
      sock = zmq.socket('pub');

var ZeroMQ = {
  connect: function(hostIP){
    // initialize ZeroMQ sync
    sock.bindSync('tcp://127.0.0.1:10250');

    console.log('Publisher bound to port 10250');
  },

  sock: sock
};

module.exports = ZeroMQ;
