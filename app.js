var express = require('express');
var bodyParser = require('body-parser');
var utils = require('./lib/util.js');
var app = express();
var data;

// required to handle larger json responses
app.use(bodyParser.json({limit: '5mb'}));

app.post('/api/brokerStatus', utils.brokerStatus);
app.post('/api/coordinatorStatus', utils.coordinatorStatus);
app.post('/api/historicalStatus', utils.historicalStatus);
app.post('/api/rtStatus', utils.rtStatus);

//Host status monitor
setInterval(utils.osInfo, 5000);

// console.log("listening on port 4000");
// app.listen(4000);


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
