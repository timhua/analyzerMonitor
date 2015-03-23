var zmq = require('zmq'),
    sock = zmq.socket('pub'),
    url = require('url'),
    os = require('os'),
    util = require('util'),
    process = require('process'),
    sys = require('sys'),
    exec = require('child_process').exec,
    druidQuery = require('./druidquery.js'),
    db = require('./psqldb.js'),
    YAML = require('yamljs'),
    fs = require('fs'),
    // jConfLoc = '/home/jolata/etc/jolata.conf',
    jConfLoc = 'jolata.conf',
    host = "192.168.20.220",
    jconf;

if(fs.existsSync(jConfLoc) ){
  var jconf = YAML.load(jConfLoc);
  console.log('Jolata.conf loaded..');
} else {
  console.log('Problem loading Jolata.cof..');
}

var database = new db(jconf);

// initialize ZeroMQ sync
sock.bindSync('tcp://127.0.0.1:11220');
console.log('Publisher bound to port 11220');

var id_query = function(id){
  return url.parse(id, true).query;
};

var getJSONdata = function(data){

};

var getPID = function(){
  if(process.pid) {
    return process.pid;
  } else {
    return 0;
  }
};

var faultCount = function(){
  var cmd = "ps -o  min_flt " + getPID();
  var count = exec(cmd , function(error, stdout){
    if(error){
      return "0";
    } else {
      console.log(stdout);
      return stdout.toString();
    }
  });
  console.log("count",count);
};
var utils = {
  osInfo: function(req, res){
    var osStatus = { 
      timestamp: (new Date).getTime(),
      version: 0,
      reporter: "Analyzer.statusMonitor",
      pid: getPID(),
      rss: util.inspect(process.memoryUsage()).rss,
      // pageFaults: faultCount(),
      endianness: os.endianness(),
      hostname: os.hostname(),
      loadavg: os.loadavg(),
      uptime: os.uptime(),
      freemem: os.freemem(),
      totalmem: os.totalmem(),
      cpus: os.cpus(),
      type: os.type(),
      release: os.release(),
      networkInterfaces: os.networkInterfaces(),
      arch: os.arch(),
      platform: os.platform(),
      tmpdir: os.tmpdir(),
      recordsPerSec: druidQuery.rowCount,
      // lastDruidSeg: lastDruidSeg.timestamp,
      timeBoundary: druidQuery.timeBoundary
    };
    sock.send(['',JSON.stringify(osStatus)]);
    console.log('Status monitor sent');
  },

  brokerStatus: function(req, res){
    var id = id_query(req.url);
    console.log("query", id);
    console.log('brokerStatus', (new Date));
    data = req.body;
    jsondata = JSON.stringify(data[0]);
    sock.send(jsondata);
    res.sendStatus(200);
  },

  coordinatorStatus: function(req, res){
    var id = id_query(req.url);
    console.log("query", query);
    var date = new Date();
    console.log('coordinatorStatus', date);
    data = req.body;
    jsondata = JSON.stringify(data[0]);
    sock.send(jsondata);
    res.sendStatus(200);
  },

  historicalStatus: function(req, res){
    var id = id_query(req.url);
    console.log("query", query);
    var date = new Date();
    console.log('historicalStatus', date);
    data = req.body;
    jsondata = JSON.stringify(data[0]);
    sock.send(jsondata);
    res.sendStatus(200);
  },

  rtStatus: function(req, res){
    var id = id_query(req.url);
    var date = new Date();
    console.log("query", query);
    console.log('rtStatus', date);
    data = req.body;
    jsondata = JSON.stringify(data[0]);
    sock.send(jsondata);
    res.sendStatus(200);
  }
};

setInterval(function(){
  druidQuery.druidQuery("timeseries", null, null, host);
  druidQuery.druidQuery("timeBoundary", null, null, host);
  // lastDruidSeg.psqlQuery();
}, 5000);

module.exports = utils;
