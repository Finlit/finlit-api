"use strict";
var mongoose = require('mongoose');
var userNotification = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
   notification: { type: mongoose.Schema.Types.ObjectId, ref: 'notification' },
   fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
   status: {
       type: String,
       enum: [
           'success', 'fail'
       ],
       default: 'fail'
   }
}, { timestamps: true });

mongoose.model('userNotification', userNotification);