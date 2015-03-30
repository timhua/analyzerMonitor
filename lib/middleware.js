var fs = require('fs'),
    // YAML = require('yamljs'),
    YAML = require('js-yaml'),
    utils = require('./util.js'),
    sock = require('./zmqConnect.js'),
    os = require('os'),
    process = require('process'),
    db = require('./psqldb.js'),
    dq = require('./druidQuery.js'),
    hostname = os.hostname().toLowerCase();
    // hostname = 'peavy';


var startTask = function(task, instance, hostIP, queryType){
  setInterval(function(){
    task(instance, hostIP, queryType);
  },5000);
};

var findTasks = function(jconf, hostIP){
  var tasks = [];
  var brokerData = {
    broker: false,
    sources: {}
  };   //Object to ensure no duplicates
  if(jconf.analyzers.hosts.hasOwnProperty(hostname)){
    var analyzerInstances = jconf.analyzers.hosts[hostname].instances;
    console.log("analyzerInstances",analyzerInstances);
    analyzerInstances.forEach(function(instance){
      if(instance.type.toLowerCase() === 'point' || 
         instance.type.toLowerCase() === 'segment' || 
         instance.type.toLowerCase() === 'broker'){
        instance.type = instance.type.toLowerCase();
        if(instance.type === 'point') {
          instance.type = 'points';
        }
        if(instance.type === 'broker'){
          brokerData.broker = true;
          brokerData.port = instance.ports[0] || 2179;
          instance.type = 'points';
          instance.datasource = ['100ms'];
        }
        if(instance.datasource){
          instance.datasource.forEach(function(ds){
            brokerData.sources[instance.type + "_" + ds] = instance.type + "_" + ds;
            if(instance.ports){
              instance.ports.forEach(function(port){
                tasks.push(dq.druidQuery("timeseries",instance.type + "_" + ds, null, hostIP, port));     
                // console.log("dq.druidQuery('timeseries'," + instance.type + "_" + ds +", null, " + hostIP + ", " + port ) ;          
              });
            }
          });
        }
      } 
    });
  if(brokerData.broker){
    console.log('broker');
    var dsKeys = Object.keys(brokerData.sources);
    var brokerPort = brokerData.port;
    dsKeys.forEach(function(ds){
      tasks.push(dq.druidQuery("timeBoundary", ds, null, hostIP, brokerPort));
      // console.log("dq.druidQuery('timeBoundary'," + ds +", null, " + hostIP + ", " + brokerPort ) ;          
    });
  }
  }

  return tasks;
};

var initialize = function(jconfloc, local){

  // Load Jolata.conf
  if(fs.existsSync(jconfloc) ){
    jconf = YAML.safeLoad(fs.readFileSync(jconfloc, 'utf8'));
    console.log('Jolata.conf loaded..');
  } else {
    console.log('Problem loading Jolata.conf..');
  }
  console.log("hostname is: ", hostname);

  // instantiat new db connection based on Jolata.conf info
  var database = new db.connect(jconf);
  var hostIP = jconf.environment.servers.hosts[hostname].oam;

  var tasks = findTasks(jconf, hostIP);
// console.log("tasksArray", tasks);

  if(local){
    if(tasks.realtime.length >= 1){
      utils.druidQuery(tasks.realtime, hostIP, "timeseries");
    }
    if(tasks.broker.length >= 1){
      utils.druidQuery(tasks.broker, hostIP, "timeBoundary");
    }
    setTimeout(function(){
      console.log(utils.osInfo(local));
      process.exit(1);
    },5000);

  }

  // Initialize ZMQ publishing
  sock.connect(hostIP);

  // if(tasks.realtime.length >= 1){ 
  //   startTask(utils.druidQuery, tasks.realtime, hostIP, "timeseries");
  // }
  // if(tasks.broker.length >= 1){
  //   startTask(utils.druidQuery, tasks.broker, hostIP, "timeBoundary");
  // }

  // startTask(utils.osInfo);
  // startTask(db.lastSeg, database);

};

module.exports = initialize;
