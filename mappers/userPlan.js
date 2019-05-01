'use strict'
const _ = require('underscore');

exports.toModel = (entity) => {
    const model = {
        id: entity._id.toJSON() || entity.id,
        startDate: entity.startDate,
        expiryDate: entity.expiryDate
    };
    if(entity.plan){
        model.plan = {
            name: entity.plan.name,
            price: entity.plan.price,
            per: entity.plan.per,
            desc: entity.plan.desc
        }
    }
    return model;
}

exports.toSearchModel = entites => {
    return _.map(entites,exports.toModel);
};