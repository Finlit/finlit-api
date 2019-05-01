
"use strict";

var mongoose = require('mongoose');

var notification = new mongoose.Schema({
   
    name: String,
    text: String,
    description: String,
    imgUrl: String,
    action: String,
    date: { type: Date },
    entityName : String,
    entityId : String,
    dataId: String,
    dataName: String,
    user:{ type:mongoose.Schema.Types.ObjectId, ref:'user' },
    // chat:{ type:mongoose.Schema.Types.ObjectId, ref:'chat' },
}, { timestamps: true });

mongoose.model('notification', notification);