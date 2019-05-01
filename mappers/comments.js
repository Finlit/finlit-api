'usee strict';
const _ = require('underscore');

let toModel = (entity) => {
    const model = {
        id: entity.id,
        text: entity.text,
        createdAt: entity.createdAt,
        //tags: entity.tags
    };

    if (entity.user) {
        model.user = {
            id: entity.user.id,
            location: entity.user.location,
            imgUrl: entity.user.imgUrl,
            name: entity.user.name,
            email: entity.user.email,
        }
    }

  

    if (entity.blog) {
        if (entity.blog._doc) {
            model.blog = {
                id: entity.blog.id,
                title: entity.blog.title,
                description: entity.blog.description,
                commentCount: entity.blog.commentCount,
                likeCount: entity.blog.likeCount,
            imgUrl: entity.blog.imgUrl,
            };
        } else {
            model.blog = {
                id: entity.blog.toString()
            };
        }
    }
    return model;
}

let toSearchModel = entities => {

    return entities.map(entity => {
        return toModel(entity);
    });
};


exports.toModel = toModel;

exports.toSearchModel = toSearchModel;
