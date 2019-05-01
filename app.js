var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');

var debug = require('debug')('nomadx-api:server');
var http = require('http');
var config = require('config').get('webServer');
const cors = require('cors');

const logger = require('./helpers/logger')('app');

var app = express();
app.use(cors());
app.use(express.static(__dirname + '/api/uploads'));

try {
  require('./settings/database').configure();
  require('./settings/express').configure(app);
  require('./settings/routes').configure(app);
} catch(err){
  console.log(err);
}

app.use((err, req, res, next) => {
  if (err) {
      res.send(500, { error: err });
      return;
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

var server = http.createServer(app);
logger.info('environment: ' + process.env.NODE_ENV);

logger.info('starting server');
server.listen(config.port, function () {
  logger.info('listening on port:' + config.port);
  console.log('listening on port:' + config.port);
});

module.exports = app;
