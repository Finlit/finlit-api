var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userconfirmed = new Schema({
    fromUser:{ type: mongoose.Schema.Types.ObjectId,ref:'user'} ,
    toUser:{ type: mongoose.Schema.Types.ObjectId,ref:'user'},
    status: {
        type: String,
        enum: [
            'pending', 'confirmed','accept','agree'
        ],
        default: 'confirmed'
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

mongoose.model('userconfirmed', userconfirmed);