"use strict"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var blog = new Schema({
    title: String,
    link: String,
    description: String,
    imgUrl: String,
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });

var blog = mongoose.model('blog', blog);
exports.blog = blog;