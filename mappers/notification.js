"use strict";
let _ = require('underscore');
let userMapper = require('./user');

let toModel = entity => {

    const model = {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        text: entity.text,
        action: entity.action,
        imgUrl: entity.imgUrl,
        entityName: entity.entityName,
        entityId: entity.entityId,
        createdAt: entity.createdAt
    };

    if (entity.fromUser) {
        model.user = {
            id: entity.fromUser.id,
            imgUrl: entity.fromUser.imgUrl,
            name: entity.fromUser.name,
            email: entity.fromUser.email,
        }
    }

    if (entity.chat) {
        model.chat = {
            id: entity.chat._id.toJSON() || entity.chat.id,
           // name: entity.chat.name
        }
    }



    return model;
};

exports.shortModel = entity => {

    let model = {
        id: entity.id,
        name: entity.notification.name,
        description: entity.notification.description,
        entityName: entity.notification.entityName,
        entityId: entity.notification.entityId,
        imgUrl: entity.notification.imgUrl,
        date: entity.notification.date,
        createdAt: entity.createdAt
    };
    return model;
};

exports.toSearchModel = entities => {

    return entities.map(entity => {
        entity.notification.fromUser = entity.fromUser;
        return toModel(entity.notification);
    });
};
exports.toModel = toModel;