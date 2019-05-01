// "use strict";
// const db = global.db;
// const logger = require('../helpers/logger')('notificationService');
// const push = require('../providers/fcm');
// const _ = require('underscore');
// const async = require('async');


// exports.create = (data, userIds,reqUser) => {
//     let model = {
//         title: data.title || 'Finlit',
//         description: data.description,
//         status: 'active',
//         entityName: data.entityName,
//         entityId: data.entityId,
//         dataName: data.dataName || data.entityName,
//         dataId: data.dataId || data.entityId,
//         imgUrl: data.imgUrl
//     }
    
//     return db.notification(model).save().then(notification => {
//         let where = {};
//         if (userIds) {
//             where = {
//                 _id: {
//                     $in: userIds
//                 }
//             }
//         };
//         db.user.find( where ).then(users => {
//             updateUserNotification(users, notification,reqUser);
//         });
//     });
// };

// let updateUserNotification = (users, notification,reqUser, cb) => {
//     let allUsers = [];
//     Array.prototype.push.apply(allUsers, users);

//     allUsers = _.uniq(allUsers, '_id');

//     async.eachSeries(allUsers, (user, next) => {
//         let model = {
//             fromUser:reqUser,
//             user: user,
//             notification: notification
//         };
//         db.userNotification(model).save().then(userNotification => {
//             push.sendPush(user.device.deviceId, {
//                 text: notification.description,
//                 imgUrl: notification.imgUrl
//             }, (err) => {
//                 userNotification.status = err ? "fail" : "success";
//                 userNotification.save();
//                 next();
//             });
//         }).catch(err => {
//             next();
//         });
//     }, (err) => {
//         if (cb) return cb();
//     });
// };

// exports.onChatCreateToMessage = async (user, chat) => {

//     let userIds = [];
//     if(user.id.toString() != chat.user.id.toString()){
//         userIds.push(chat.user.id.toString());
//     }
//     if(userIds.length == 0){
//         return;
//     }

//     let description = `A new chat massage(Chat No: ${chat.id}) has been send.`;
//     exports.create({
//         title: 'chat',
//         description : description,
//         entityName: 'chat',
//         entityId: chat.id,
//         dataName: 'User',
//         dataId: user.id,
//         imgUrl: user.imgUrl,
//     }, userIds,user);
// }


"use strict";
const db = global.db;
const logger = require('../helpers/logger')('notificationService');
const push = require('../providers/fcm');
const _ = require('underscore');
const async = require('async');
var mapper = require('../mappers/user');


exports.create =  (data, userIds,reqUser) => {
    let model = {
        title: data.title || 'Finlit',
        description: data.description,
        status: 'active',
        entityName: data.entityName,
        entityId: data.entityId,
        dataName: data.dataName || data.entityName,
        dataId: data.dataId || data.entityId,
        imgUrl: data.imgUrl
    }
    
    return db.notification(model).save().then(notification => {
        let where = {};
        if (userIds) {
            where = {
                _id: {
                    $in: userIds
                }
            }
        };
        db.user.find( where ).then(users => {
            updateUserNotification(users, notification,reqUser);
        });4
    });
};

let updateUserNotification = (users, notification,reqUser, cb) => {
    let allUsers = [];
    Array.prototype.push.apply(allUsers, users);

    allUsers = _.uniq(allUsers, '_id');

    async.eachSeries(allUsers, (user, next) => {
        let model = {
            fromUser:reqUser,
            user:user,
            notification: notification
        };
        db.userNotification(model).save().then(userNotification => {
            push.sendPush(user.device.deviceId, {
                text: notification.description,
                imgUrl: notification.imgUrl
            }, (err) => {
                userNotification.status = err ? "fail" : "success";
                userNotification.save();
                next();
            });
        }).catch(err => {
            next();
        });
    }, (err) => {
        if (cb) return cb();
    });
};

exports.onChatCreateToMessage = async (user, chat) => {

    let userIds = [];
    if(user.id.toString() != chat.user.id.toString()){
     if(chat.participants[0].user == user.id ){
        userIds.push(chat.participants[1].user);
     }
     if(chat.participants[1].user == user.id ){
        userIds.push(chat.participants[0].user);
     }
    }

    // if (req.query.user) {
    //       where.user = req.query.user                     //user hai ja ni
    //  }

    if(userIds.length == 0){
        return;
    }

    let description = `A new message from ${user.name}`;
    exports.create({
        title: 'chat',
        description : description,
        entityName: 'chat',
        entityId: chat.id,
        dataName: 'User',
        dataId: user.id,
        imgUrl: user.imgUrl,
    }, userIds,user);
}