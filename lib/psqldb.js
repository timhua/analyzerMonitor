var Sequelize = require('sequelize'),
    q = require('q');

module.exports = function(jconf){
  var dbHost = Object.keys(jconf.rdbms.hosts)[0],
      dbIP = jconf.environment.servers.hosts[dbHost].oam,
      auth = jconf.rdbms.hosts[dbHost].instances[0];

  var sequelize = new Sequelize(auth.dbName, auth.user, auth.password, {
  host: dbIP,
  dialect: 'postgres'
  });

  sequelize.authenticate().complete(function(err){
  if(err){
    console.log(err);
  } else {
    console.log("connected to Jolata DB");
  }
  });
};
