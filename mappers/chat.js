const _ = require('underscore');
const userMapper = require('../mappers/user');

exports.toModel = (entity) => {
    let model = {
        id: entity.id,
        text: entity.text,
        lastMessage: entity.lastMessage,
        chatType: entity.chatType,
        user: userMapper.toSmallModel(entity.user),
        participants: []
    }

    if (entity.participants) {
        _.each(entity.participants, participant => {
            model.participants.push({
                user: userMapper.toSmallModel(participant.user),
                unreadCount: participant.unreadCount,
                isBlocked: participant.isBlocked,
                isAdmin: participant.isAdmin
            });
        })
    }

    if (entity.users && entity.users.length) {
        model.user = {
            id: entity.users[0]._id.toJSON() || entity.users[0].id,
            imgUrl: entity.users[0].imgUrl,
            name: entity.users[0].name,
            email: entity.users[0].email,
        }
    } else if (entity.user) {
        model.user = {
            id: entity.user._id.toJSON() || entity.user.id,
            imgUrl: entity.user.imgUrl,
            name: entity.user.name,
            email: entity.user.email,
        }
    }

    
    return model;
}

exports.toSearchModel = (entitys) => {
    return _.map(entitys, exports.toModel);
};