var utils = require('./util.js');

var heartbeat = {
  runCheck: function(){
    var nodeStatus = true;
    var nodeStatusCount = [0,0, 0];
    for(var nodes in utils.heartbeat.details){
      var node = utils.heartbeat.details[nodes];
      if(node.lastResponse !== 'PENDING'){
        var diff = Math.floor(((new Date).getTime() - (new Date(node.lastResponse).getTime())) / 1000);
        if(diff >= 90) {
          node.status = 'STOPPED: no response in ' + diff + 's';
        }
      }
      if(node.status !== 'RUNNING' && node.status !== 'PENDING'){
        nodeStatus = false;
        nodeStatusCount[1]++;
      } else if(node.status !== 'PENDING' && node.status !== 'STOPPED') {
        nodeStatusCount[0]++;
      } else if(node.status === 'PENDING'){
        nodeStatusCount[2]++;
      }
    }
    if(nodeStatus) {
      utils.heartbeat.runStatus = 'RUNNING';
    } else {
      utils.heartbeat.runStatus = 'STOPPED';
    }
    utils.heartbeat.nodeStatus = nodeStatusCount[0] + " nodes running, " + nodeStatusCount[1] + 
                                 " down, " + nodeStatusCount[2] + " pending. " + 
                                 (nodeStatusCount[0] + nodeStatusCount[1] + nodeStatusCount[2]) + " total."; 
  },

  populateHeartbeat: function(jconf, hostname){
    var analyzerInstances = jconf.analyzers.hosts[hostname].instances;
      analyzerInstances.forEach(function(instance){
      if(instance.type.toLowerCase() != 'zookeeper'){
        // console.log(instance);
        if(instance.ports){
          instance.ports.forEach(function(port){
            utils.heartbeat.details[port] = {
              status: 'PENDING',
              type: instance.type,
              dataSource: String(instance.datasource),
              lastResponse: 'PENDING'
            };
          });
        }
      }
    });
  }
};

module.exports = heartbeat;
