"use strict"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var plan = new Schema({
    name: String,
    price: Number,
    per: String,
    desc: String
});

var plan = mongoose.model('plan', plan);
exports.plan = plan;