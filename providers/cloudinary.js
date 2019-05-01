'use strict';
const cloudinaryConfig = require('config').get('providers.cloudinary');
const cloudinary = require('cloudinary');
const formidable = require('formidable');


cloudinary.config({
    cloud_name: cloudinaryConfig.name,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.secret
});


exports.upload = (file, cb, entityName, entityId) => {
    let options = {};
    if (entityId)
        options = {
            overwrite: true,
            public_id: `${entityName}_${entityId}`
        }

    cloudinary.v2.uploader.upload(file, options, (error, result) => {
        cb(error, result);
    })
}