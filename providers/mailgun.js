'use strict';
const logger = require('../helpers/logger')('providers.mailgun');
var mailgun = require('mailgun-js');
var defaultConfig = require('config').get('providers.mailgun');



exports.email = (toEmail, message) => {

    if (!toEmail) {
        return Promise.reject('to email is required');
    }

    if (!message) {
        return Promise.reject('message is required');
    }

    if (!message.body) {
        return Promise.reject('message.body is required');
    }


    let log = logger.start('sending Mail');
    let data = {
        to: toEmail,
        subject: message.subject || 'FinLit',
        html: message.body,
        from: defaultConfig.from,
    };

    return new Promise((resolve, reject) => {
        (new mailgun({
            apiKey: defaultConfig.api_key,
            domain: defaultConfig.domain,
        })).messages().send(data, function(err, body) {
            if (err) {
                log.silly("Err: " + err);
                return resolve(null);
            }
            logger.info(body);
            return resolve(null);
        });
    });
};