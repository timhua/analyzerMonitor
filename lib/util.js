var zmq = require('./zmqConnect.js'),
    sock = zmq.sock,
    url = require('url'),
    os = require('os'),
    util = require('util'),
    process = require('process'),
    // sys = require('sys'),
    // exec = require('child_process').exec,
    druidQuery = require('./druidquery.js'),
    db = require('./psqldb.js'),
    YAML = require('yamljs'),
    fs = require('fs'),
    hostname = os.hostname(),
    jconf;


var id_query = function(id){
  return url.parse(id, true).query;
};

var utils = {
  osInfo: function(local){
    var osStatus = { 
      timestamp: (new Date).getTime(),
      version: 0,
      reporter: "Analyzer.systemStatusMonitor",
      componentName: "systemStatusMonitor",
      runStatus: "running...",
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
    nodeStatus: "pending",
    runStatus: "pending",
    details: {}
  },
  brokerStatus: function(req, res){
    utils.apiResponse(req, res, "brokerStatus");
  },

  coordinatorStatus: function(req, res){
    utils.apiResponse(req, res, "coordinatorStatus");
  },

  historicalStatus: function(req, res){
    utils.apiResponse(req,res, "historicalStatus");
  },

  rtStatus: function(req, res){
    utils.apiResponse(req, res, "rtStatus");
  },

  apiResponse: function(req, res, type){
    var id = id_query(req.url);
    var date = new Date();
    console.log(date, type, "query: ", id);
    utils.heartbeat.details[id.id].status = "running";
    utils.heartbeat.details[id.id].lastResponse = date;
    res.sendStatus(200);
  }
};

module.exports = utils;
