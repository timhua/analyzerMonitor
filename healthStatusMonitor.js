var express = require('express');
var bodyParser = require('body-parser');
var process = require('process');
var utils = require('./lib/util.js');
var app = express();
var jconf = '';

if(process.argv[2]){
  jconf = process.argv[2] + '/etc/jolata.conf';
} else {
  jconf = '/home/jolata/etc/jolata.conf';
}

// local flag, prints locally to console and exits if true
if(process.argv[3] == '-l'){
  var local = true;
}
// required to handle larger json responses
// app.use(bodyParser.json({limit: '5mb'}));


console.log("Using Jolata conf file:",jconf);
require('./lib/middleware.js')(jconf, local);

if(!local){
  console.log("listening on port 4000");
  app.listen(4000);
}

// druid rest responses
app.post('/api/brokerStatus', utils.brokerStatus);
app.post('/api/coordinatorStatus', utils.coordinatorStatus);
app.post('/api/historicalStatus', utils.historicalStatus);
app.post('/api/realtimeStatus', utils.rtStatus);


// //////////////////////////////////////////////////////////////////////
// // testing only, used to display data received from druid nodes //////
// app.use(express.static(__dirname + '/public'));
// // app.use(bodyParser.json());
// app.get('/', function(req,res){
//   var query = url.parse(req.url, true).query;
//   console.log(query);
//   res.send('index.html');
//   res.sendStatus(200);
// });

// app.get('/api/getData', function(req,res){
//   res.send(data);
// });
//////////////////////////////////////////////////////////////////////
