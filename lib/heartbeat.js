var utils = require('./util.js');

var heartbeat = {
  runCheck: function(){
    // console.log(utils.heartbeat.details);
    for(var node in utils.heartbeat.details){
      console.log(utils.heartbeat.details[node]status);
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
