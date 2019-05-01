'use strict'
const _ = require('underscore');

exports.toModel = (entity) => {
    const model = {
        id: entity._id.toJSON() || entity.id,
        name: entity.name,
        price: entity.price,
        per: entity.per,
        desc: entity.desc
    };
    
    return model;
}

exports.toSearchModel = entites => {
    return _.map(entites,exports.toModel);
};