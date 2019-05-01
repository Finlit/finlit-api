
'use strict';
const mongoose = require('mongoose');
const dbConfig = require('config').get('db');
const logger = require('../helpers/logger')('settings.database');
global.toObjectId = id => mongoose.Types.ObjectId(id);

module.exports.configure = function(app) {
   mongoose.Promise = global.Promise;

   var connect = function() {
       logger.info('connecting to', dbConfig);
       mongoose.connect(dbConfig.host);
   };

   connect();

   var db = mongoose.connection;

   db.on('connected', function() {
       logger.info('DB Connected');
       console.log('DB Connected');
   });

   db.on('error', function(err) {
       logger.error('Mongoose default connection error: ' + err);
   });

   db.on('disconnected', function() {
       logger.info('Again going to connect DB');
       connect();
   });

   global.db = require('../models');
   return global.db;
};