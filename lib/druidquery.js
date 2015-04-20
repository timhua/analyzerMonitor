var moment = require('moment'),
    unirest = require('unirest'),
    promise = require('bluebird');
    bodyParser = require('body-parser'),
    process = require('process');


var druidQuery = {
  getAverageRowCount: function(queryResult){
    var totalRowCount = 0;
      if(queryResult === undefined || queryResult <= 0 )  {
        return "0";
      }
      queryResult.forEach(function(obj){
        totalRowCount += obj.result.rowCount;
      });
      return Math.floor(totalRowCount / queryResult.length);
  },

  druidQuery: function(queryType, dataSource, interval, host, port){
    var startTimer = (new Date).getTime();

    return new promise(function(resolve, reject){
      var query = {
            "queryType": queryType,
            "dataSource": dataSource
          };

      if(queryType === "timeseries"){
        var now = moment.utc().toISOString(),
            start =  moment.utc().subtract(1, 'minutes').toISOString();

            query.granularity = {"type": "period", "period": "PT1s"};
            query.aggregations = [ {"type": "count", "name": "rowCount"} ];
            query.intervals = [start + '/' + now];
         }
    // console.log("queryType", queryType, "dataSource", dataSource, "host", host, "port", port);
      unirest.post('http://' + host + ':'+ port +'/druid/v2/?')
        .header( { 'content-type':'application/json' })
        .send(JSON.stringify(query))
        .end(function(response){
          if(response.error){
            // console.log(JSON.stringify(query) + "\n", "host", host, "port", port);
            if(queryType === "timeBoundary"){
              if(!(druidQuery.timeBoundary[dataSource])){
                druidQuery.timeBoundary[dataSource] = {};
              }
              druidQuery.timeBoundary[dataSource] = 'Error fetching data';
            }
            if(queryType === "timeseries"){
              if(!(druidQuery.recordsPerSec[dataSource])){
                druidQuery.recordsPerSec[dataSource] = {};
              }
              druidQuery.recordsPerSec[dataSource][port] = 'Error fetching data';
            }
            resolve(response.error);
          } else {
            var responseTime = ((new Date).getTime() - startTimer);
            if(queryType === "timeBoundary") {
              if(!(druidQuery.timeBoundary[dataSource])){
                druidQuery.timeBoundary[dataSource] = {};
              }
              var result = JSON.parse(response.body);
              // console.log("timeBoundary Result:",result);
              if(result.length <= 0) {
                druidQuery.timeBoundary[dataSource].result = 'null';
              } else {
                druidQuery.timeBoundary[dataSource].result = result[0].result;
              }
              druidQuery.timeBoundary[dataSource]["responseTime/ms"] = responseTime;
            } 
            if(queryType === "timeseries") {
              if(!(druidQuery.recordsPerSec[dataSource])) {
                druidQuery.recordsPerSec[dataSource] = {};
              } 
              if (!(druidQuery.recordsPerSec[dataSource][port])){
                druidQuery.recordsPerSec[dataSource][port] = {};
              }
              druidQuery.recordsPerSec[dataSource][port].result = druidQuery.getAverageRowCount(JSON.parse(response.body));
              druidQuery.recordsPerSec[dataSource][port]["responseTime/ms"] = responseTime;
            }
          resolve(response.body);
          // console.log('resolved druidQuery');
        }
      });
    });
  },
  recordsPerSec: {},
  timeBoundary: {}
};

module.exports = druidQuery;
