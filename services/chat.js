'use strict';
let mapper = require('../mappers/chat');
const notificationService = require('../services/notification');


exports.updateParticipant = async (req, res, type) => {
    try {
        let chat = await db.chat.findOne({
            _id: toObjectId(req.params.id),
            "participants.user": req.user
        });
        if (!chat) {
            return res.failure('chat not found');
        }

        if(type=="inc"){
            chat.lastMessage=req.body.lastMessage;
        }

        chat.participants.forEach(participant => {
            if (participant.user.toJSON() != req.user.id) {
                switch (type) {
                    case 'inc':
                        ++participant.unreadCount;
                        notificationService.onChatCreateToMessage(req.user , chat);
                        break;
                    case 'block':
                        participant.isBlocked = true;
                        break;
                    case 'unblock':
                        participant.isBlocked = false;
                        break;
                }
            }
            if (participant.user.toJSON() == req.user.id) {
                switch (type) {
                    case 'setZero':
                        participant.unreadCount = 0;
                        break;
                }

            }
        });
        await chat.save();
      
        return res.data(mapper.toModel(chat));

    } catch (e) {
        return res.failure(e);
    }
};