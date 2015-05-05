var Sequelize = require('sequelize'),
    promise = require('bluebird'),
    q = require('q');

var psqldb = {
  connect: function(jconf){
    var dbHost = Object.keys(jconf.rdbms.hosts)[0],
        dbIP = jconf.environment.servers.hosts[dbHost].metadata,
        auth = jconf.rdbms.hosts[dbHost].instances[0];

    var sequelize = new Sequelize(auth.dbName, auth.user, auth.password, {
      host: dbIP,
      dialect: 'postgres'
    });

    sequelize.authenticate().complete(function(err){
      if(err){
        console.log("error connecting to Jolata DB:", err);
      } else {
        console.log("connected to Jolata DB");
      }
    });
    return sequelize;
  },

  lastSeg: function(db){
    return new promise(function(resolve, reject){
      db.query("select created_date from druid_segments order by created_date desc limit 1")
        .then(function(data, error){
          if(error){
            psqldb.lastSegTimestamp = 'Error fetching data';
            resolve(error);
          } else {
            if(data[0].length === 0){
              psqldb.lastSegTimestamp = 'null';
            } else {
              psqldb.lastSegTimestamp = data[0][0].created_date;
            }
            resolve(data[0]);
          }
        });
    });
  },
  lastSegTimestamp: 0
};

module.exports = psqldb;
