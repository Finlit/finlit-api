
// 'use strict';
// var fcmConfig = require('config').get('providers.fcm');
// var FCM = require('fcm-node');

// var fcm = new FCM(fcmConfig.serverKey);

// exports.sendPush = function(fcmToken, message, cb) {

//     var message = {
//         to: fcmToken,
//         data: {
//             title: 'Finlit',
//             content: message.text,
//             imgUrl: message.imgUrl
//         }
//     };
//     fcm.send(message, function(err, response) {
//         if (err) {
//             if (cb) {
//                 return cb(err)
//             }
//         } else {
//             if (cb) {
//                 return cb(null)
//             }
//         }
//     });
// }

// exports.sendMulticast = function(fcmTokens, message, cb) {

//     var message = {
//         registration_ids: fcmTokens,
//         data: {
//             title: 'Finlit',
//             content: message.text,
//             imgUrl: message.imgUrl
//         },
//         notification: {
//             title: "Finlit",
//             body: message.text
//         },
//         content_available: true,
//         priority: "high",
//     };
//     fcm.send(message, function(err, response) {
//         if (err) {
//             if (cb) {
//                 return cb(err)
//             }
//         } else {
//             if (cb) {
//                 return cb(null)
//             }
//         }
//     });
// }


'use strict';
var fcmConfig = require('config').get('providers.fcm');
var FCM = require('fcm-node');

var fcm = new FCM(fcmConfig.serverKey);

exports.sendPush = function(fcmToken, message, cb) {

    var message = {
        to: fcmToken,
        data: {
            title: 'Finlit',
            content: message.text,
            imgUrl: message.imgUrl
        },
        notification: {
            title: "Finlit",
            body: message.text
        },
        content_available: true,
        priority: "high",
    };
    fcm.send(message, function(err, response) {
        if (err) {
            if (cb) {
                return cb(err)
            }
        } else {
            if (cb) {
                return cb(null)
            }
        }
    });
}

exports.sendMulticast = function(fcmTokens, message, cb) {

    var message = {
        registration_ids: fcmTokens,
        data: {
            title: 'Finlit',
            content: message.text,
            imgUrl: message.imgUrl
        }
    };
    fcm.send(message, function(err, response) {
        if (err) {
            if (cb) {
                return cb(err)
            }
        } else {
            if (cb) {
                return cb(null)
            }
        }
    });
}