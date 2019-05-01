"use strict"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var question = new Schema({
    label: String,
    questionType: {
        type: String,
        enum: [
            'six', 'tan'
        ],
       // default: '6'
    },
    options: [{ text : String, isCorrect: Boolean }]
}, { timestamps: true });


var question = mongoose.model('question', question);
exports.question = question;