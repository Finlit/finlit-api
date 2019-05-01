'use strict';
const config = require('config').get('providers.forwardvaluesms');
const Client = require('node-rest-client').Client;
const client = new Client();
const logger = require('@open-age/logger')('forwardvaluesms');



exports.send = (msisdn, msg) => {
    const url = `${config.api}?user=${config.user}&password=${config.password}&msisdn=${msisdn}&sid=${config.sid}&msg=${encodeURIComponent(msg)}&fl=${config.fl}`;

    logger.info(`START SENDING SMS ${url}`);


    const args = {
        data: null,
        headers: { "Content-Type": "application/json" }
    };

    client.post(url, args, function (data, response) {
        // logger.debug(response);
    });

}