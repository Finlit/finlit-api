"use strict";

var mongoose = require('mongoose');
var blockUser = new mongoose.Schema({
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });

mongoose.model('blockUser', blockUser);