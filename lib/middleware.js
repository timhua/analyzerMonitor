var fs = require('fs'),
    YAML = require('js-yaml'),
    promise = require('bluebird'),
    zmq = require('./zmqConnect.js'),
    sock = zmq.sock,
    os = require('os'),
    process = require('process'),
    db = require('./psqldb.js'),
    dq = require('./druidquery.js'),
    utils = require('./util.js'),
    heartbeat = require('./heartbeat.js'),
    hostname = os.hostname().toLowerCase(),
    jconf;

    // hostname = 'peavy';

var findTasks = function(jconf, hostIP, database){
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
    if( Object.keys(utils.heartbeat.details).length === 0){
      analyzerInstances.forEach(function(instance){
        if(instance.type.toLowerCase() != 'zookeeper'){
          console.log(instance);
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
  }
  console.log(self.brokerData);
  // populates heartbeat with expected node instances

};

var initialize = function(jconfloc, local){

  // Load Jolata.conf
  if(fs.existsSync(jconfloc) ){
    jconf = YAML.safeLoad(fs.readFileSync(jconfloc, 'utf8'));
    console.log('Jolata.conf loaded..');
  } else {
    console.log('Problem loading Jolata.conf, exiting..');
    process.exit(0);
  }
  console.log("hostname is: ", hostname);
  if(!jconf.environment.servers.hosts.hasOwnProperty(hostname)){
    console.log("Cannot find data on", hostname, "... exiting");
    process.exit(0);
  }
  // instantiat new db connection based on Jolata.conf info
  var database = new db.connect(jconf);
  var hostIP = jconf.environment.servers.hosts[hostname].oam;
  var zmqPort = jconf.analyzers.hosts[hostname].status.port || 10250;
  var statusInt = jconf.analyzers.hosts[hostname].status.statusInterval * 1000 || 5000;

  console.log('status heartbeat interval is', statusInt);

  if(local){
    var tasks = new findTasks(jconf, hostIP, database);
    promise.all(tasks.tasks)
      .then(function(){
        var status = utils.osInfo(local);
        status.recordsPerSec = dq.recordsPerSec;
        status.timeBoundary = dq.timeBoundary;
        console.log(status);
        process.exit(1);
      });
  }

  // Populate heartbeat processes


  // Initialize ZMQ publishing
  if(!local){
    zmq.connect(hostIP, zmqPort);
  }

  setInterval(function(){
    // console.log("jconf:",jconf,"hostip:",hostIP);
    var tasks = new findTasks(jconf, hostIP, database);
    var date = new Date();
    // console.log("tasks:", tasks.tasks.length);
    promise.all(tasks.tasks)
      .then(function(){
        var status = utils.osInfo();
        status.recordsPerSec = dq.recordsPerSec;
        status.timeBoundary = dq.timeBoundary;
        status.endpoint = hostIP + ":" + zmqPort;
        sock.send(['',JSON.stringify(status)]);
        console.log(date,'Status monitor sent');
      });
    heartbeat.runCheck();  
    console.log("heartbeat", utils.heartbeat);
  }, statusInt);

};


module.exports = initialize;
