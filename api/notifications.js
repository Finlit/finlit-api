// "use strict";
// const db = global.db;
// const mapper = require('../mappers/notification');
// const async = require('async');
// const updationScheme = require('../helpers/updateEntities');
// const logger = require('../helpers/logger')('notification');
// const push = require('../providers/fcm');

// //const notificationService = require('../services/notification');

// //exports.create = async (req, res) => {
//    // notificationService.create(req.user , chats);
// //};

// exports.search = async (req, res) => {
   
//     let PageNo = Number(req.query.pageNo || 1);
//     let pageSize = Number(req.query.pageSize);
//     let toPage = (PageNo || 1) * (pageSize || 10);
//     let fromPage = toPage - (pageSize || 10);
//     let pageLmt = (pageSize || 10);
//     let totalRecordsCount = 0;
//     let serverPaging = req.query.serverPaging == "false" ? false : false;
//     let where = {};

//     // if(req.user){
//     //     where.user = req.user;
//     // }

// //     if (req.query.user) {
// //         where.user = req.query.user                     //user hai ja ni
// //     }

// //    where._id = { $ne: req.user.id }

 

//     let promises = [db.userNotification.find(where).count()];
//     if (serverPaging) {
//         promises.push(db.userNotification.find(where).populate('notification').populate('user').sort([['createdAt', -1]]).skip(fromPage).limit(pageLmt));
//     } else {
//         promises.push(db.userNotification.find(where).populate('notification').populate('user').sort([['createdAt', -1]]));
//     }
//     try {
//         let result = await Promise.all(promises)
//         return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);
//     } catch (e) {
//         return res.failure(e);
//     }
// };


"use strict";
const db = global.db;
const mapper = require('../mappers/notification');
const async = require('async');
const updationScheme = require('../helpers/updateEntities');
const logger = require('../helpers/logger')('notification');

exports.create = async (req, res) => {
    try {
        let data = {
            name: req.body.name,
            description: req.body.description,
            imgUrl:req.body.imgUrl,
            action:req.body.action,
            entityName:req.body.entityName,
            post:req.body.postId
        }
        data.user = req.user;
        let notification = await new db.notification(data).save();
        return res.data(mapper.toModel(notification));
    } catch (e) {
        return res.failure(e);
    }
};

exports.search = async (req, res) => {
   
    let PageNo = Number(req.query.pageNo || 1);
    let pageSize = Number(req.query.pageSize);
    let toPage = (PageNo || 1) * (pageSize || 10);
    let fromPage = toPage - (pageSize || 10);
    let pageLmt = (pageSize || 10);
    let totalRecordsCount = 0;
    let serverPaging = req.query.serverPaging == "false" ? false : false;
    let where = {};

    if(req.user){
        where.user = req.user;
    }

    let promises = await [db.userNotification.find(where).count()];
    if (serverPaging) {
        promises.push(db.userNotification.find(where).populate('notification').populate('fromUser').sort([['createdAt', -1]]).skip(fromPage).limit(pageLmt));
    } else {
        promises.push(db.userNotification.find(where).populate('notification').populate('fromUser').sort([['createdAt', -1]]));
    }
    try {
        let result = await Promise.all(promises)
        return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);
    } catch (e) {
        return res.failure(e);
    }
};