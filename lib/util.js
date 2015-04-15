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
    runStatus: "pending...",
    details: {

    }
  },
  brokerStatus: function(req, res){
    var id = id_query(req.url);
    var date = new Date();
    console.log("query", id);
    console.log('brokerStatus', date);
    utils.heartbeat.details[id.id].status = "running";
    utils.heartbeat.details[id.id].date = date;
    // data = req.body;
    // jsondata = JSON.stringify(data[0]);
    // sock.send(['',jsondata]);
    res.sendStatus(200);
  },

  coordinatorStatus: function(req, res){
    var id = id_query(req.url);
    console.log("query", id);
    var date = new Date();
    console.log('coordinatorStatus', date);
    utils.heartbeat.details[id.id].status = "running";
    utils.heartbeat.details[id.id].date = date;
    // data = req.body;
    // jsondata = JSON.stringify(data[0]);
    // sock.send(jsondata);
    res.sendStatus(200);
  },

  historicalStatus: function(req, res){
    var id = id_query(req.url);
    console.log("query", id);
    var date = new Date();
    console.log('historicalStatus', date);
    utils.heartbeat.details[id.id].status = "running";
    utils.heartbeat.details[id.id].date = date;
    // data = req.body;
    // jsondata = JSON.stringify(data[0]);
    // sock.send(jsondata);
    res.sendStatus(200);
  },

  rtStatus: function(req, res){
    var id = id_query(req.url);
    var date = new Date();
    console.log("query", id);
    console.log('rtStatus', date);
    utils.heartbeat.details[id.id].status = "running";
    utils.heartbeat.details[id.id].date = date;
    // data = req.body;
    // jsondata = JSON.stringify(data[0]);
    // sock.send(jsondata);
    res.sendStatus(200);
  }
};

module.exports = utils;
