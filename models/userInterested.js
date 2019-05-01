'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userInterested = new Schema({
    fromUser:{ type: mongoose.Schema.Types.ObjectId,ref:'user'} ,
    toUser:{ type: mongoose.Schema.Types.ObjectId,ref:'user'}
}, { timestamps: true });

mongoose.model('userInterested', userInterested);