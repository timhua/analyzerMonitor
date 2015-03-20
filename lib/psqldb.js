var Sequelize = require('sequelize'),
    q = require('q');

var sequelize = new Sequelize('jolata', 'jolata', 'jolata', {
  host: '192.168.20.220',
  dialect: 'postgres'
});

sequelize.authenticate().complete(function(err){
  if(err){
    console.log(err);
  } else {
    console.log("connected to Jolata DB");
  }
});

var lastDruidSeg = {
  psqlQuery: function(){
    sequelize.query("select created_date from druid_segments order by created_date desc limit 1")
      .then(function(data){
        lastDruidSeg.timestamp = data[0][0].created_date;
      });
  },
  timestamp: '0'
};


module.exports = lastDruidSeg;
