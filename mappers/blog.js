'use strict'
const _ = require('underscore');

exports.toModel = (entity) => {
    const model = {
        id: entity._id.toJSON() || entity.id,
        title: entity.title,
        description: entity.description,
        imgUrl: entity.imgUrl,
        link: entity.link,
        likeCount: entity.likeCount || 0,
        commentCount: entity.commentCount || 0,
        isLike: entity.isLike 
    };

    if (entity.users && entity.users.length) {
        model.user = {
            id: entity.users[0]._id.toJSON() || entity.users[0].id,
            location: entity.users[0].location,
            imgUrl: entity.users[0].imgUrl,
            name: entity.users[0].name,
            email: entity.users[0].email,
        }
    } else if (entity.user) {
        model.user = {
            id: entity.user._id.toJSON() || entity.user.id,
            location: entity.user.location,
            imgUrl: entity.user.imgUrl,
            name: entity.user.name,
            email: entity.user.email,
        }
    }


    return model;
}

exports.toSearchModel = entites => {
    return _.map(entites, exports.toModel);
};

let toCommentModel = (entity) => {
    const model = {
        id: entity.id,
        text: entity.text
    };
    return model;
};

let toLikeModel = entities => {
    return entities.map(entity => {
        return toUserModel(entity.user);
    });
};

exports.toLikeModel = toLikeModel;
exports.toCommentModel = toCommentModel;