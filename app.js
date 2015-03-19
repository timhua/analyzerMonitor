var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var zmq = require('zmq'),
    sock = zmq.socket('pub');
var data;
var url = require('url');


// initialize ZeroMQ sync
sock.bindSync('tcp://192.168.20.220:11220');
console.log('Publisher bound to port 11220');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function(req,res){
  var query = url.parse(req.url, true).query;
  console.log(query);
  res.send('index.html');
  res.sendStatus(200);
});

app.get('/api/getData', function(req,res){
  res.send(data);
});
app.get('/api/druidLogs', function(req,res){
  var query = url.parse(req.url, true).query;
  console.log("query",query);
  res.send('hello');
});

app.post('/api/brokerStatus', function(req,res){
  var query = url.parse(req.url, true).query;
  console.log("query", query);
  var date = new Date();
  console.log('brokerStatus', date);
  data = req.body;
  jsondata = JSON.stringify(data[0]);
  sock.send([jsondata]);
  res.sendStatus(200);
});

app.post('/api/coordinatorStatus', function(req,res){
  var query = url.parse(req.url, true).query;
  console.log("query", query);
  var date = new Date();
  console.log('coordinatorStatus', date);
  data = req.body;
  jsondata = JSON.stringify(data[0]);
  sock.send([jsondata]);
  res.sendStatus(200);
});

app.post('/api/rtStatus', function(req,res){
  var query = url.parse(req.url, true).query;
  var date = new Date();
  console.log("query", query);
  console.log('rtStatus', date);
  data = req.body;
  jsondata = JSON.stringify(data[0]);
  sock.send([jsondata]);
  res.sendStatus(200);
});

console.log("listening on port 4000");
app.listen(4000);
