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
      reporter: "Analyzer.statusMonitor",
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
  brokerStatus: function(req, res){
    var id = id_query(req.url);
    console.log("query", id);
    console.log('brokerStatus', (new Date));
    data = req.body;
    jsondata = JSON.stringify(data);
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

module.exports = utils;
