'use strict';
const awsConfig = require('config').get('providers.aws');
const AWS = require('aws-sdk');
const fs = require('fs');


const s3bucket = new AWS.S3({
    accessKeyId: awsConfig.key,
    secretAccessKey: awsConfig.secret,
    Bucket: awsConfig.bucket,
});

exports.deleteImage = (id, url) => {
    return new Promise(async(resolve, reject) => {

        var params = {
            Bucket: `${awsConfig.bucket}/dev`,
            Key: `${id}${url.substr(url.lastIndexOf("."))}`
        };
        s3bucket.deleteObject(params, function(err, data) {
            if (err) {
                return resolve(err)
            }
            return resolve(data);
        });
    })
}

exports.uploadclubToS3 = (file, id) => {
    return new Promise(async(resolve, reject) => {

        let fileData = fs.readFileSync(file.path);
        var params = {
            Bucket: `${awsConfig.bucket}/dev`,
            Key: `${id}${file.name.substr(file.name.lastIndexOf("."))}`,
            Body: fileData,
            // ContentType: file.type
        };
        s3bucket.upload(params, function(err, data) {
            if (err) {
                return reject(err)
            }
            return resolve(data);
        });
    })
}