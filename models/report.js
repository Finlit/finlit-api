
"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var reportSchema = new Schema({
    fromUser: {type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });

var user = mongoose.model('report', reportSchema);
exports.user = user;