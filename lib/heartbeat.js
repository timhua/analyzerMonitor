var utils = require('./util.js');

var heartbeat = {
  runCheck: function(){
    var nodeStatus = true;
    for(var nodes in utils.heartbeat.details){
      var node = utils.heartbeat.details[nodes];
      // console.log( ((new Date).getTime() - (new Date(node.lastResponse).getTime()) * 60000));
      if(node.lastResponse !== 'pending'){
        var diff = Math.floor(((new Date).getTime() - (new Date(node.lastResponse).getTime())) / 1000);
        if(diff >= 90) {
          node.status = 'Error: no response in ' + diff + 's';
        }
      }
      if(node.status !== 'running' && node.status !== 'pending'){
        nodeStatus = false;
      } 
    }
    if(nodeStatus) {
      utils.heartbeat.runStatus = 'running';
    } else {
      utils.heartbeat.runStatus = 'Error';
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
              status: 'pending',
              type: instance.type,
              dataSource: String(instance.datasource),
              lastResponse: 'pending'
            };
          });
        }
      }
    });
  }
};

module.exports = heartbeat;
