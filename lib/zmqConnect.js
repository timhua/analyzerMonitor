  var zmq = require('zmq'),
      sock = zmq.socket('pub');

var ZeroMQ = {
  connect: function(){
    // initialize ZeroMQ sync
    sock.bindSync('tcp://127.0.0.1:11220');
    console.log('Publisher bound to port 11220');
  },

  sock: sock
};

module.exports = ZeroMQ;
