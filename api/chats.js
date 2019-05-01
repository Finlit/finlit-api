'use strict'
const mapper = require('../mappers/chat');
const _ = require('underscore');
const updationScheme = require('../helpers/updateEntities');
const chatService = require('../services/chat');
const favouriteService = require('../services/user');
const userService = require('../services/user');
//const notificationService = require('../services/notification');
// exports.fcm = (req, res) => {
//     fcm.sendPush("e-jYBwgIp2g:APA91bF0Yy7Q9P_tpWA14bflOdDfRS_kPTvNMbPaNJKrxJXnYhgMkmWchkXgGQTTTB1nX9MFBE48iktZ5HqQHQ9aNGw42lOSSk1AXwQt6imzPM9mGGSWXV0v9xu1gSvLn--wkGpmrDJRe3xLYsEer2BJrJJUYZtwrQ",{text:"test msg"},(err)=>{
//         res.data(err)

//     });
// };


exports.create = async (req, res) => {

    if (!req.body.chatType) {
        return res.failure("Please Enter chatType");
    }
    let model = {
        text: req.body.text,
        chatType: req.body.chatType.toLowerCase(),
        user: req.user,
        participants: []
    };
    if (!req.body.participants) {
        return res.failure("Please add participants");
    }
    _.each(req.body.participants, participant => {
        if (!participant.userId) {
            return res.failure("Please Enter userId in opponent ");
        }
        model.participants.push({ user: toObjectId(participant.userId) });
    });
    model.participants.push({ user: toObjectId(req.user.id), isAdmin: true });

    try {
        let chat = null;
        if (req.body.chatType == 'normal') {
            var where = {
                chatType: req.body.chatType.toLowerCase(),
                participants: {
                    $all: [
                        { "$elemMatch": { user: toObjectId(req.body.participants[0].userId) } },
                        { "$elemMatch": { user: toObjectId(req.user.id) } }
                    ]
                }
            }

            chat = await db.chat.findOne(where);
            if (chat) {
                return res.data(mapper.toModel(chat));
            }
        }

        chat = await new db.chat(model).save();
       
        return res.data(mapper.toModel(chat));
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

    var query = {
        "participants.user": req.user,
        lastMessage: { $ne: null }
    }

    let promises = [db.chat.find(query).count()];
    if (serverPaging) {
        promises.push(db.chat.find(query).sort([['updatedAt', -1]]).populate('participants.user').populate('user').skip(fromPage).limit(pageLmt));
    } else {
        promises.push(db.chat.find(query).sort([['updatedAt', -1]]).populate('participants.user').populate('user'));
    }

    try {
        // let blockedusers = await userService.getBlockedUsers(req.user);
        // blockedusers.push(req.user._id);
        // query._id = { $nin: blockedusers }
        let result = await Promise.all(promises);
        if (req.user) {
            result[1] = await favouriteService.checkCurrentUserFavouriteInChats(req.user, result[1]);
        }
       // await userService.addIsBlockInUsers(result[1]);
        return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);

    } catch (e) {
        return res.failure(e);
    }
};

exports.block = (req, res) => {
    return chatService.updateParticipant(req, res, 'block')
};
exports.unblock = (req, res) => {
    return chatService.updateParticipant(req, res, 'unblock')
};

exports.incUnreadCount = (req, res) => {
    return chatService.updateParticipant(req, res, 'inc')
   
};

exports.setZeroUnreadCount = (req, res) => {
    return chatService.updateParticipant(req, res, 'setZero')
};

exports.delete = (req, res) => {
    db.chat.findById(req.params.id)
        .then(chat => {
            if (!chat) return res.failure(`chat not found`);
            chat.remove().then(() => {
                return res.success('chat deleted successfully ');
            }).catch(err => res.failure(err))
        }).catch(err => res.failure(err))
};