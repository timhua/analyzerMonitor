var fs = require('fs'),
    YAML = require('js-yaml'),
    promise = require('bluebird'),
    zmq = require('./zmqConnect.js'),
    os = require('os'),
    process = require('process'),
    db = require('./psqldb.js'),
    // dq = require('./druidquery.js'),
    utils = require('./util.js'),
    heartbeat = require('./heartbeat.js'),
    hostname = os.hostname().toLowerCase(),
    zmqCount = 0;

var initialize = function(jconfloc, local){
  var statusInt,
      statusZMQPort,
      hbZMQPort,
      jconf;

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
    console.log("Cannot find data on", hostname, "in jolata.conf... exiting");
    process.exit(0);
  }

  // instantiate new db connection based on Jolata.conf info and set vitals
  var database = new db.connect(jconf);
  var hostIP = jconf.environment.servers.hosts[hostname].metadata;

  // if local is flagged, one time status monitor call, prints results to console and exits
  if(local){
    var tasks = new utils.findTasks(jconf, hostIP, database);
    promise.all(tasks.tasks)
      .then(function(){
        var status = new utils.osInfo();
        console.log(JSON.stringify(status, null, 2));
        process.exit(1);
      });
  }

  // Initialize ZMQ publishing
  if(!local){
    // assigning ZMQ ports, exits gracefully if not found
    try {
     statusZMQPort = jconf.analyzers.hosts[hostname].status.port;
     hbZMQPort = jconf.healthMonitors.hosts[hostname].status.port;
    } catch(error) {
      console.log("ZMQ port not found in jolata.conf. Exiting...");
      console.log("Error:", error);
      process.exit(1);
    }
    
    statusInt = jconf.analyzers.hosts[hostname].status.statusInterval * 1000 || 5000;
    console.log('status heartbeat interval is', statusInt);

    var statusZMQ = new zmq(hostIP, statusZMQPort, "status");
    var heartbeatZMQ = new zmq(hostIP, hbZMQPort, "heartbeat");

    // Populate heartbeat processes
    heartbeat.populateHeartbeat(jconf, hostname);

    // sends status and heartbeat zmq messages on set interval, defaults to 5s if not specified in jolata.conf
    setInterval(function(){
      var tasks = new utils.findTasks(jconf, hostIP, database);
      var date = new Date();
      var status, hb;
      zmqCount++;
      promise.all(tasks.tasks)
        .then(function(){
          status = new utils.osInfo();
          status.endpoint = "tcp://" + hostIP + ":" + statusZMQPort;
          statusZMQ.send(['',JSON.stringify(status)]);
          if(zmqCount >= 10){
          console.log("STATUS:", JSON.stringify(status));
          }
        });
      heartbeat.runCheck();  
      hb = new utils.heartbeat();
      hb.endpoint = "tcp://" + hostIP + ":" + hbZMQPort;
      heartbeatZMQ.send(['', JSON.stringify(hb)]);
      if(zmqCount >= 10){
        console.log("HEARTBEAT:", JSON.stringify(hb));
        zmqCount = 0;
      }
    }, statusInt);
  }
};

module.exports = initialize;
