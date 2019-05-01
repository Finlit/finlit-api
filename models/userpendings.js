'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userpending = new Schema({
    fromUser:{ type: mongoose.Schema.Types.ObjectId,ref:'user'} ,
    toUser:{ type: mongoose.Schema.Types.ObjectId,ref:'user'},
    status: {
        type: String,
        enum: [
            'pending', 'confirmed','accept','agree'
        ],
        default: 'pending'
    },
    userlocation: {
        address: String,
        coordinates: {
          type: [Number],// [<longitude>, <latitude>]
          index: '2dsphere' // create the geospatial index
         
        }
    },
    date:{type:String},

}, { timestamps: true });

mongoose.model('userpending', userpending);