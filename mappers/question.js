'use strict'
const _ = require('underscore');

exports.toModel = (entity) => {
    const model = {
        id: entity._id.toJSON() || entity.id,
        label: entity.label,
        questionType: entity.questionType,
        options: []
    };

    if(entity.options){
        _.forEach(entity.options, option => {
            model.options.push({
                id: option.id,
                text: option.text,
                isCorrect: option.isCorrect
            });
        });
    }

    return model;
}

exports.toSearchModel = entites => {
    return _.map(entites,exports.toModel);
};