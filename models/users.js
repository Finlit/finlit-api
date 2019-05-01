"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: { type : String },
    activationCode: { type: String },
    password: { type: String },
    aboutUs: { type: String },
    gender: {
        type: String,
        enum: [
            'male', 'female'
        ]
        
    },
    ageGroup: { type: Number },
    question: [ String ],
    email: { type: String },
    username: { type : String },
    facebookId: { type: String },
    imgUrl: { type: String },
    isPaidQuiz: { type: Boolean, default: false},
    isProfileCompleted: { type: Boolean, default: false},
    isUserInterested: { type: Boolean, default: false},
    subscribed: { type: Boolean, default: false},
    favouriteCount: { type: Number, default: 0 },
    reportCount:{type: Number,default:0},
    interest: [{ question : String, answer: String }],
    thankCount: { type: Number, default: 0 },
    date:{type:String},
    location: {
        address: String,
        coordinates: {
          type: [Number],// [<longitude>, <latitude>]
          index: '2dsphere' // create the geospatial index
         
        }
    },
    userlocation: {
        address: String,
        coordinates: {
          type: [Number],// [<longitude>, <latitude>]
          index: '2dsphere' // create the geospatial index
         
        }
    },
    device: {
        deviceId: String,
        deviceType: String
    },
    token: { type: String },
    profileType: {
        type: String,
        enum: [
            'novice', 'proficent', 'expert'
        ],
        default: 'novice'
    },
    count: {
        blog: {
          likes: { type: Number, default: 0 },

          total: { type: Number, default: 0 }
        }
      },

    status: {
        type: String,
        enum: [
            'pending', 'active','inactive','on','off'
        ],
        default: 'pending'
    },
    role: {
        type: String,
        enum: [
            'admin', 'normal'
        ],
        default: 'normal'
    }
}, { timestamps: true });

var user = mongoose.model('user', userSchema);
exports.user = user;