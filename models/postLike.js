"use strict";

var mongoose = require('mongoose');

var postLike = new mongoose.Schema({
    // type: {
    //     type: String,
    //     enum: [
    //       'smile', 'heart', 'sad','smile light','teeth hanger','smile full','tounge','angry','down','front thumb','thumb up'
    //     ],
    //     default: 'heart'
    // },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'blog' }
}, { timestamps: true });

mongoose.model('postLike', postLike);