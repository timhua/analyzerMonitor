var utils = require('./util.js');

var heartbeat = {
  runCheck: function(){
    utils.heartbeat.details.forEach(function(node){
      if(node.status !== 'running'){
        utils.heartbeat.runStatus = "Error";
      } else if(node.status !== 'pending'){
        utils.heartbeat.runStatus = "pending";
      } else {
        utils.heartbeat.runStatus = "running";
      }
    });
  }
};

module.exports = heartbeat;
