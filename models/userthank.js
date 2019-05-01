'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userthank = new Schema({
    fromUser:{ type: mongoose.Schema.Types.ObjectId,ref:'user'} ,
    toUser:{ type: mongoose.Schema.Types.ObjectId,ref:'user'}
}, { timestamps: true });

mongoose.model('userthank', userthank);