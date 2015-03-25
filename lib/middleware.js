var fs = require('fs'),
    // YAML = require('yamljs'),
    YAML = require('js-yaml'),
    utils = require('./util.js'),
    sock = require('./zmqConnect.js'),
    os = require('os'),
    db = require('./psqldb.js'),
    // hostname = os.hostname(),
    hostname = 'peavy';

var startTask = function(task, instance, hostIP, queryType){
  setInterval(function(){
    task(instance, hostIP, queryType);
  },5000);
};

var findTasks = function(jconf, hostIP){
  var realtimeInstances = [];
  var brokerInstances = [];
  if(jconf.analyzers.hosts.hasOwnProperty(hostname)){
    var analyzerInstances = jconf.analyzers.hosts[hostname].instances;
    analyzerInstances.forEach(function(instance){
      if(instance.type.toLowerCase() === 'realtime'){
        realtimeInstances.push(instance);
      } 
      if(instance.type.toLowerCase() === 'broker'){
        brokerInstances.push(instance);
      }
    });
  }

  return {
    realtime: realtimeInstances,
    broker: brokerInstances
  };
};

var initialize = function(jconfloc){

  // Load Jolata.conf
  if(fs.existsSync(jconfloc) ){
    jconf = YAML.safeLoad(fs.readFileSync(jconfloc, 'utf8'));
    console.log('Jolata.conf loaded..');
    console.log(jconf.environment.servers);
  } else {
    console.log('Problem loading Jolata.conf..');
  }

  // Initialize ZMQ publishing
  sock.connect();

  // instantiat new db connection based on Jolata.conf info
  var database = new db.connect(jconf);
  var hostIP = jconf.environment.servers.hosts[hostname].oam;


  var tasks = findTasks(jconf, hostIP);
  if(tasks.realtime){ 
    startTask(utils.druidQuery, tasks.realtime, hostIP, "timeseries");
  }
  if(tasks.broker){
    startTask(utils.druidQuery, tasks.broker, hostIP, "timeBoundary");
  }

  startTask(utils.osInfo);
  startTask(db.lastSeg, database);

};

module.exports = initialize;
