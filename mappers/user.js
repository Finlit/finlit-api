'usee strict';
const _ = require('underscore');
exports.toModel = (entity) => {
    const model = {
        id: entity._id.toJSON() || entity.id,
        name: entity.name,
        aboutUs: entity.aboutUs,
        gender: entity.gender,
        ageGroup: entity.ageGroup,
        question: entity.question,
        email: entity.email,
        status: entity.status,
        username: entity.username,
        profileType: entity.profileType,
        isProfileCompleted: entity.isProfileCompleted,
        isUserInterested: entity.isUserInterested,
        isPaidQuiz: entity.isPaidQuiz,
        imgUrl: entity.imgUrl,
        role: entity.role,
        favouriteCount: entity.favouriteCount,
        reportCount: entity.reportCount,
        isFavourite: entity.isFavourite,
        isInterest: entity.isInterest,
        isSendr: entity.isSendr,
        isConfirmed: entity.isConfirmed,
        isThanks: entity.isThanks,
        thankCount: entity.thankCount,
        createdAt: entity.createdAt,
        date: entity.date,
        updatedAt: entity.updatedAt,
        location: null,
        userlocation: null,
        interest: []
    };

    if (entity.interest) {
        _.forEach(entity.interest, interest => {
            model.interest.push({
                id: interest.id,
                question: interest.question,
                answer: interest.answer
            });
        });
    }

    if (entity.location) {
        model.location = {
            address: entity.location.address,
            coordinates: entity.location.coordinates
        }
    }

    if (entity.userlocation) {
        model.userlocation = {
            address: entity.userlocation.address,
            coordinates: entity.userlocation.coordinates
        }
    }
    return model;
}

exports.toSearchModel = entities => {
    return _.map(entities, exports.toModel);
};

exports.toBlockModel = entities => {
    return entities.map(entity => {
        return exports.toModel(entity.toUser);
    });
};

exports.toPendingModel = entities => {
    return entities.map(entity => {
        return exports.toModel(entity.toUser);
    });
};

exports.toAuthModel = (entity) => {
    let model = exports.toModel(entity);
    model.token = entity.token;
    return model;
}

exports.toSmallModel = (entity) => {
    const model = {
        id: entity._id.toJSON() || entity.id,
        name: entity.name,
        aboutUs: entity.aboutUs,
        isFavourite: entity.isFavourite,
        isProfileCompleted: entity.isProfileCompleted,
        imgUrl: entity.imgUrl
    };
    if (entity.location) {
        model.location = {
            address: entity.location.address,
            coordinates: entity.location.coordinates
        }
    }
    return model;
}