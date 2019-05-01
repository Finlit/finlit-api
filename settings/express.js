'use strict';

const express = require('express');
const logger = require('../helpers/logger')('express');
const bodyParser = require('body-parser');
const path = require('path');

var cookieParser = require('cookie-parser');
// var logger = require('morgan');


module.exports.configure = (app) => {

    app.use(function (err, req, res, next) {
        if (err) {
            (res.log || log).error(err.stack);
            if (req.xhr) {
                res.send(500, { error: 'Something blew up!' });
            } else {
                next(err);
            }

            return;
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        next();
    });

    const log = logger.start('config');





    // app.use(logger('dev'));
    // app.use(express.json());
    // app.use(express.urlencoded({ extended: false }));
    // app.use(cookieParser());

    app.use(require('morgan')("combined",{ "stream": logger.stream }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    const root = path.normalize(__dirname + './../');
    app.set('views', path.join(root, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(root, 'public')));
    // app.use(bodyParser({ limit: '50mb', keepExtensions: true }));


};