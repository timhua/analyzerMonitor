var url = require('url'),
    os = require('os'),
    util = require('util'),
    process = require('process'),
    disk = require('diskusage'),
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
  osInfo: {
    // var osStatus = { 
    timestamp: ((new Date).getTime()/1000),
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
    diskInfo: {},
    cpus: {
      type: os.cpus()[0].model,
      cores: os.cpus().length
    },
    type: os.type(),
    release: os.release(),
    arch: os.arch(),
    platform: os.platform(),
    recordsPerSec: dq.recordsPerSec,
    timeBoundary: dq.timeBoundary,
    lastDruidSeg: db.lastSegTimestamp
  },

  heartbeat: {
    reporter: "Analyzer.heartbeat",
    timestamp: ((new Date).getTime()/1000),
    hostname: hostname,
    componentName: "heartbeat",
    nodeStatus: "PENDING",
    runStatus: "PENDING",
    details: {}
  },

  diskInfo: function(location, node, type){
    if(!utils.osInfo.diskInfo[node]){
      utils.osInfo.diskInfo[node] = {};
    }
    disk.check(location, function(err, info){
      if(err){
        utils.osInfo.diskInfo[node][type] = "Error fetching data";
      } else {
        var percent = Math.floor((info.free / info.total) * 100);
        utils.osInfo.diskInfo[node][type] = "free/total: " + info.free + "/" + info.total  +", % free: " + percent + "%";
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

};

module.exports = utils;
