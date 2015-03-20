var moment = require('moment'),
    unirest = require('unirest'),
    bodyParser = require('body-parser'),
    q = require('q');


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

  druidQuery: function(queryType, dataSource, interval, host){
  // return q.promise(function(resolve, reject){

    var queryType = queryType || "timeseries",
        dataSource = dataSource || "points_100ms",
        interval = interval || 1,
        host = host || "127.0.0.1",
        now = moment.utc().toISOString(),
        start =  moment.utc().subtract(interval, 'minutes').toISOString(),
        query = {
          "queryType": queryType,
          "dataSource": dataSource
        };
    if(queryType === "timeseries"){
          query.granularity = {"type": "period", "period": "PT1s"};
          query.aggregations = [ {"type": "count", "name": "rowCount"} ];
          query.intervals = [start + '/' + now];
       }
    
    unirest.post('http://' + host + ':2179/druid/v2/?')
      .header( { 'content-type':'application/json' })
      .send(query)
      .end(function(response){
        if(queryType === "timeBoundary") {
          // console.log('TB', response.body[0].result);
          druidQuery.timeBoundary = response.body[0].result;
        } else {
        druidQuery.rowCount = druidQuery.getAverageRowCount(response.body);
      }
    });

  },
  rowCount: '0',
  timeBoundary: '0'
};

module.exports = druidQuery;
