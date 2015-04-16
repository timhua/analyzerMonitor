var zmq = require('./zmqConnect.js'),
    sock = zmq.sock,
    url = require('url'),
    os = require('os'),
    util = require('util'),
    process = require('process'),
    druidQuery = require('./druidquery.js'),
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
  osInfo: function(local){
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
      cpus: {
        type: os.cpus()[0].model,
        cores: os.cpus().length
      },
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      platform: os.platform(),
      lastDruidSeg: db.lastSegTimestamp
    };
    if(local) {
      return osStatus;
    }
    return osStatus;
  },

  heartbeat: {
    reporter: "Analyzer.heartbeat",
    timestamp: (new Date).getTime(),
    hostname: hostname,
    componentName: "heartbeat",
    nodeStatus: "PENDING",
    runStatus: "PENDING",
    details: {}
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

};

module.exports = utils;
