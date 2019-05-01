'use strict'
const _ = require('underscore');
exports.toModel = (entity) => {
    let model = {
        id:entity.id,
        fromUser:entity.fromUser,
        toUser:entity.toUser
    }
    return model;
}
exports.toSearchModel = (entity) => {
 return _.map(entity,exports.toModel);
};