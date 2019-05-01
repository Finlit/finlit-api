'use strict' 
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chats = new Schema({
    text: { type : String },
    lastMessage: { type : String },
    chatType: {
        type: String,
        enum: ['normal', 'group'],
        default: 'normal'
    },
    user:{ type:mongoose.Schema.Types.ObjectId,ref:'user' },
    participants:[{ 
        user: { type:mongoose.Schema.Types.ObjectId, ref:'user' },
        unreadCount: { type: Number, default: 0 },
        isBlocked: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false }
    }]
},{ timestamps: true });

mongoose.model('chat',chats);

//, {stimestamps:true}