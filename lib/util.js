var url = require('url'),
    os = require('os'),
    util = require('util'),
    process = require('process'),
    heartbeat = require('./heartbeat.js'),
    sys = require('sys'),
    exec = require('child_process').exec,
    dq = require('./druidquery.js'),
    db = require('./psqldb.js'),
    YAML = require('yamljs'),
    fs = require('fs'),
    hostname = os.hostname(),
    jconf;


var id_query = function(id){
  return url.parse(id, true).query;
};

var apiResponse = function(req, res, type){
  var id = id_query(req.url);
  var date = new Date();
  console.log(date, type, "query: ", id);
  utils.heartbeat.details[id.id].status = "RUNNING";
  utils.heartbeat.details[id.id].lastResponse = date;
  res.sendStatus(200);
};

var utils = {
  diskData: {},
  osInfo: function() {
    var osStatus = { 
      timestamp: (new Date).getTime(),
      version: 0,
      reporter: "Analyzer.systemStatusMonitor",
      componentName: "systemStatusMonitor",
      runStatus: "running",
      pid: process.pid,
      rss: util.inspect(process.memoryUsage()).rss,
      hostname: hostname,
      loadavg: os.loadavg(),
      uptime: os.uptime(),
      freemem: os.freemem(),
      totalmem: os.totalmem(),
      diskInfo: utils.diskData,
      cpus: {
        type: os.cpus()[0].model,
        cores: os.cpus().length
      },
      release: os.release(),
      arch: os.arch(),
      platform: os.platform(),
      recordsPerSec: dq.recordsPerSec,
      timeBoundary: dq.timeBoundary,
      lastDruidSeg: db.lastSegTimestamp
    };
    return osStatus;
  },

  heartbeat: function() {
    var hb = {
      reporter: "Analyzer.heartbeat",
      timestamp: (new Date).getTime(),
      hostname: hostname,
      componentName: "heartbeat",
      nodeStatus: heartbeat.nodeStatus,
      runStatus: heartbeat.runStatus,
      details: heartbeat.details
    };
    return hb;
  },

  diskInfo: function(location, node, type){
    if(!utils.diskData[node]){
      utils.diskData[node] = {};
    }
    var space = exec('df ' + location + '| grep -v Filesystem', function(error, stdout, stderr){
      if(error){
        utils.diskData[node][type] = "Error fetching data; " + error;
      } else {
        var info = stdout.split(/\s+/);
        utils.diskData[node][type] = "free/total: " + info[3] + "/" + info[1] + ", % used " + info[4];
      }
    });
  },

  brokerStatus: function(req, res){
    apiResponse(req, res, "brokerStatus");
  },

  coordinatorStatus: function(req, res){
    apiResponse(req, res, "coordinatorStatus");
  },

  historicalStatus: function(req, res){
    apiResponse(req,res, "historicalStatus");
  },

  rtStatus: function(req, res){
    apiResponse(req, res, "rtStatus");
  },

  // returns an array of promises/tasks based on nodes running on this host in jolata.conf
  findTasks: function(jconf, hostIP, database){
    var self = this;
    this.tasks = [];
    this.brokerData = {
      broker: false,
      sources: {}
    };

    if(jconf.analyzers.hosts.hasOwnProperty(hostname)){
      var analyzerInstances = jconf.analyzers.hosts[hostname].instances;
      analyzerInstances.forEach(function(instance){
        if(instance.type.toLowerCase() === 'point' || 
           instance.type.toLowerCase() === 'segment' || 
           instance.type.toLowerCase() === 'broker'){
          var instanceType = instance.type.toLowerCase();
          if(instanceType === 'broker'){
            self.brokerData.broker = true;
            self.brokerData.port = instance.ports[0] || 2179;
            instanceType = 'point';
            instance.datasource = ['100ms'];
          } 
          if(instance.intermediatePersist){
            self.tasks.push(utils.diskInfo(instance.intermediatePersist, instanceType+":"+instance.ports, "intermediatePersist"));
          }
          if(instance.deepStorage){
            self.tasks.push(utils.diskInfo(instance.deepStorage, instanceType+":"+instance.ports, "deepStorage"));
          }
          if(instance.datasource){
            instance.datasource.forEach(function(ds){
              self.brokerData.sources[instanceType + "s_" + ds] = instanceType + "_" + ds;
              if(instance.ports){
                instance.ports.forEach(function(port){
                  self.tasks.push(dq.druidQuery("timeseries",instanceType + "s_" + ds, null, hostIP, port)); 
                  // console.log("dq.druidQuery('timeseries'," + instance.type + "_" + ds +", null, " + hostIP + ", " + port ) ;          
                });
              }
            });
          }
        } 
      });
      if(self.brokerData.broker){
        var dsKeys = Object.keys(self.brokerData.sources);
        var brokerPort = self.brokerData.port;
        dsKeys.forEach(function(ds){
          self.tasks.push(dq.druidQuery("timeBoundary", ds, null, hostIP, brokerPort));
          // console.log("dq.druidQuery('timeBoundary'," + ds +", null, " + hostIP + ", " + brokerPort ) ;          
        });
      }
      if(jconf.rdbms.hosts.hasOwnProperty(hostname)){
        self.tasks.push(db.lastSeg(database));
      }
    }
  }
};

module.exports = utils;
