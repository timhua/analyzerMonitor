var utils = require('./util.js');

var heartbeat = {
  runCheck: function(){
    // console.log(utils.heartbeat.details);
    for(var nodes in utils.heartbeat.details){
      var node = utils.heartbeat.details[nodes];
      if(node.lastResponse !== 'pending' && node.lastResponse !== 'Error'){
        node.lastResponse = (Date.parse(new Date()) - Date.parse(node.lastResponse));
      }
      if(node.status !== 'running' && node.status !== 'pending'){
        utils.heartbeat.runStatus = "Error";
      } else if(node.status == 'pending'){
        utils.heartbeat.runStatus = "pending";
      } else {
        utils.heartbeat.runStatus = "running";
      }
    }
  },

  populateHeartbeat: function(jconf, hostname){
    var analyzerInstances = jconf.analyzers.hosts[hostname].instances;
      analyzerInstances.forEach(function(instance){
      if(instance.type.toLowerCase() != 'zookeeper'){
        // console.log(instance);
        if(instance.ports){
          instance.ports.forEach(function(port){
            utils.heartbeat.details[port] = {
              status: "pending",
              type: instance.type,
              dataSource: String(instance.datasource),
              lastResponse: "pending"
            };
          });
        }
      }
    });
  }
};

module.exports = heartbeat;
