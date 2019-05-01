"use strict"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userPlan = new Schema({
    startDate: Date,
    expiryDate: Date,
    user:{ type:mongoose.Schema.Types.ObjectId, ref:'user' },
    plan:{ type:mongoose.Schema.Types.ObjectId, ref:'plan' }
});

var userPlan = mongoose.model('userPlan', userPlan);
exports.userPlan = userPlan;