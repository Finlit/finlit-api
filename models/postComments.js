"use strict";

var mongoose = require('mongoose');

var postComment = new mongoose.Schema({
    text: { type: String },
   // reportCount: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'blog' },
   
}, { timestamps: true });

mongoose.model('postComment', postComment);