var moment = require('moment'),
    unirest = require('unirest'),
    promise = require('bluebird');
    bodyParser = require('body-parser');

var druidQuery = {
  getAverageRowCount: function(queryResult){
    var totalRowCount = 0;
      if(queryResult === undefined || queryResult.length <= 0 )  {
        return 0;
      }
      queryResult.forEach(function(obj){
        totalRowCount += obj.result.rowCount;
      });
      return Math.floor(totalRowCount / queryResult.length);
  },

  druidQuery: function(queryType, dataSource, interval, host, port){
    return new promise(function(resolve, reject){
      var queryType = queryType || "timeseries",
          dataSource = dataSource || "points_100ms",
          interval = interval || 1,
          host = host || "127.0.0.1",
          port = port || '2179',
          query = {
            "queryType": queryType,
            "dataSource": dataSource
          };

      if(queryType === "timeseries"){
        var now = moment.utc().toISOString(),
            start =  moment.utc().subtract(interval, 'minutes').toISOString();

            query.granularity = {"type": "period", "period": "PT1s"};
            query.aggregations = [ {"type": "count", "name": "rowCount"} ];
            query.intervals = [start + '/' + now];
         }
      unirest.post('http://' + host + ':'+ port +'/druid/v2/?')
        .header( { 'content-type':'application/json' })
        .send(query)
        .end(function(response){
          if(response.error){
            reject(response.error);
          } else {

            if(queryType === "timeBoundary") {
              if(!(druidQuery.timeBoundary[dataSource])){
                druidQuery.timeBoundary[dataSource] = {};
              }
              // druidQuery.timeBoundary[dataSource] = response.body[0].result;
            } 
            if(queryType === "timeseries") {
              if(!(druidQuery.recordsPerSec[dataSource])){
                druidQuery.recordsPerSec[dataSource] = {};
              }
              druidQuery.recordsPerSec[dataSource][port] = druidQuery.getAverageRowCount(response.body);
            }
            resolve(druidQuery.getAverageRowCount(response.body));
        }
      });
    });
  },
  recordsPerSec: {},
  timeBoundary: {}
};

module.exports = druidQuery;
