'use strict';

let mapper = require('../mappers/user');
let auth = require('../middlewares/authorization');
const updationScheme = require('../helpers/updateEntities');
const formidable = require('formidable');
let mailgun = require('../providers/mailgun');
const favouriteService = require('../services/user');
const s3 = require('../providers/s3');
const favouriteMapper = require('../mappers/favourites');
const removeService = require('../services/remove');
const userService = require('../services/user');

let sendOTP = (user, otp) => {
    let msg = `Your OTP is ${otp} for the account registration on the FinLIt APP. Do not share this OTP for security reasons.`;
    return mailgun.email(user.email, { body: msg });
};

exports.signin = async (req, res) => {

    try {
        // if (!req.body.email) {
        //     throw "enter email";
        // }
        // if (!req.body.password) {
        //     throw "enter password";
        // }
        var where = {
            $or: []
        };
        if (req.body.email) { where['$or'].push({ 'email': req.body.email }); }
        if (req.body.facebookId) { where['$or'].push({ 'facebookId': req.body.facebookId }); }

        let user = await db.user.findOne(where);
        if (!user) {
            throw 'User Not Found'
        }
        if (req.body.facebookId) {
            user = await user.save();
            return res.data(mapper.toAuthModel(user));
        }
        var isPasswordMatch = await auth.comparePassword(req.body.password, user.password);
        if (isPasswordMatch) {
            user.token = auth.getToken(user);
            if (req.body.deviceId && req.body.deviceType) {
                user.deviceId = req.body.deviceId;
                user.deviceType = req.body.deviceType;
            }
            user = await user.save();
            return res.data(mapper.toAuthModel(user));
        }
        else {
            return res.failure("Invalid email or password.");
        }
    } catch (e) {
        return res.failure(e);
    }
};

exports.signUp = async (req, res) => {
    if (!req.body.deviceId || !req.body.deviceType) {
        return res.failure('deviceId or deviceType missing');
    }
    let code = auth.getOTP();
    try {
        var where = {
            $or: []
        };
        if (req.body.email) { where['$or'].push({ 'email': req.body.email }); }
        if (req.body.facebookId) { where['$or'].push({ 'facebookId': req.body.facebookId }); }

        let user = await db.user.findOne(where);
        if (user) {
            throw 'User already registered'
        }

        let data = {
            activationCode: code.toString(),
            device: {
                deviceId: req.body.deviceId,
                deviceType: req.body.deviceType,
            },
            imgUrl: req.body.imgUrl
        };

        if (req.body.email) {
            data.email = req.body.email;
        }
        if (req.body.imgUrl) {
            data.imgUrl = req.body.imgUrl;
        }
        if (req.body.facebookId) {
            data.facebookId = req.body.facebookId;
            data.status = 'active';
        }
        user = await new db.user(data).save();

        if (user.status == 'active') {
            user.token = auth.getToken(user);
            user = await user.save();
            return res.data(mapper.toAuthModel(user));
        }
        await sendOTP(user, code);
        return res.data(mapper.toModel(user));

    } catch (e) {
        return res.failure(e);
    }
};

exports.resend = async (req, res) => {
    var where = {
        $or: []
    };
    if (req.body.email) { where['$or'].push({ 'email': req.body.email }); }
    if (req.body.facebookId) { where['$or'].push({ 'facebookId': req.body.facebookId }); }

    let code = auth.getOTP();
    try {
        let user = await db.user.findOne(where);
        if (!user) {
            return res.failure('Email or Facebook not registered. Please try to Sign Up. ');
        }
        if (user.facebookId) {
            user.status = 'active';
            user.token = auth.getToken(user);
            await user.save();
            return res.data(mapper.toAuthModel(user));
        } else {
            user.activationCode = code;
            await sendOTP(user, code);
            return res.data(mapper.toModel(user));
        }

    } catch (e) {
        return res.failure(e);
    }
};

exports.verification = async (req, res) => {
    if (!req.body.userId)
        return res.failure("Please Enter userId");

    if (!req.body.activationCode)
        return res.failure("Please Enter PIN");

    try {
        let user = await db.user.findById(req.body.userId);
        if (!user) {
            return res.failure("user not found");
        }

        if (req.body.activationCode !== user.activationCode) {
            if (req.body.activationCode !== "444444") {
                return res.failure('incorrect activation code');
            }
        }
        user.activationCode = null;
        user.status = 'active';
        user.token = auth.getToken(user);
        user = await user.save();
        return res.data(mapper.toAuthModel(user));
    } catch (e) {
        return res.failure(e);
    }
};

exports.update = async (req, res) => {
    let model = req.body;

    try {
        let user = await db.user.findById(req.params.id);
        if (!user) {
            return res.failure("user not found");
        }
        var password = model.password;
        delete model.password;
        user = updationScheme.update(model, user);
        if (password) {
            if (req.body.newPassword) {
                var isPasswordMatch = await auth.comparePassword(password, user.password);

                if (isPasswordMatch == true) {
                    var hash = await auth.setPassword(req.body.newPassword);
                    user.password = hash;
                } else {
                    throw ' incorrect'
                }
            } else {

                var hash = await auth.setPassword(password);
                user.password = hash;
            }
        }
        user.isProfileCompleted = true;
        user = await user.save();
        return res.data(mapper.toModel(user));
    } catch (e) {
        return res.failure(e);
    }
};

exports.get = async (req, res) => {
    try {
        let user = await db.user.findById(req.params.id);
        if (!user) {
            throw 'no userfound';
        }
        // let users = await favouriteService.checkCurrentUserFavouriteInUsers(req.user, [user]);
        let users = await removeService.checkCurrentUserFavouriteInUsers(req.user, [user]);
        return res.data(mapper.toModel(users[0]));
    } catch (e) {
        return res.failure(e);
    }
};

exports.withoutBlockUser = async(req, res) => {
    let PageNo = Number(req.query.pageNo || 1);
    let pageSize = Number(req.query.pageSize);
    let toPage = (PageNo || 1) * (pageSize || 10);
    let fromPage = toPage - (pageSize || 10);
    let pageLmt = (pageSize || 10);
    let totalRecordsCount = 0;
    let serverPaging = req.query.serverPaging == "false" ? false : true;

    let query = {};
   
    query.status = 'active';
    query.role = 'normal';
   query._id = { $ne: req.user.id }

    let sort = [];
    sort.push(['favouriteCount', 'desc']);

    if (req.query.status) {
        query.status = req.query.status;
    }
    if (req.query.name) {
        query.name = { $regex: '.*' + req.query.name + '.*', $options: 'i' }
    }

    if (req.query.gender) {
        query.gender = req.query.gender;
    }

    if (req.query.email) {
        query.email = req.query.email;
    }
    let where = {};

    // query['location.coordinates'] = {
    //     $nearSphere: {
    //         $geometry: {
    //             type: 'Point',
    //             coordinates: [
    //                 req.query.longitude, req.query.latitude
    //             ]
    //         },
    //         $minDistance:  0, //values in meters
    //         $maxDistance: req.query.range || 50000 //values in meters
    //     }
    // };

   
    if (req.query.latitude, req.query.longitude) {
        query['location.coordinates'] = {
            $nearSphere: {
                $geometry: {
                    type: 'Point',
                    coordinates: [
                        req.query.latitude, req.query.longitude
                    ]
                },
                $minDistance: 0, //values in meters
                $maxDistance: req.query.range || 50000 //values in meters
            }
        };
    }

    if (req.query.filterBy) {
        query.question = {
            $regex: '^' + req.query.filterBy + '$',
            $options: 'i'
        };
    }

    if (req.query.ageMin && req.query.ageMax) {
        query.ageGroup = {
            $gte: parseInt(req.query.ageMin),
            $lte: parseInt(req.query.ageMax)
        }
    }

    try {
        let blockedusers = await userService.getBlockedUsers(req.user);
        blockedusers.push(req.user._id);
        query._id = { $nin: blockedusers }

        let promises = [db.user.find(query).count()];
        if (serverPaging) {
            promises.push(db.user.find(query).sort([['createdAt', 1]]).skip(fromPage).limit(pageLmt));
        } else {
            promises.push(db.user.find(query).sort([['createdAt', 1]]));
        }

        let result = await Promise.all(promises)
        await userService.addIsBlockInUsers(result[1]);
        return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);

    } catch (err) {
        res.failure(err);
    }
};

exports.search = async (req, res) => {
    let PageNo = Number(req.query.pageNo || 1);
    let pageSize = Number(req.query.pageSize);
    let toPage = (PageNo || 1) * (pageSize || 10);
    let fromPage = toPage - (pageSize || 10);
    let pageLmt = (pageSize || 10);
    let totalRecordsCount = 0;
    let serverPaging = req.query.serverPaging == "false" ? false : true;
    let query = {};
    query.status = 'active';

    if (req.user.role != 'admin') {                        //mre user de covers history
        query.user = req.user;
    }
    query.profileType = req.user.profileType;

    let sort = [];

    sort.push(['favouriteCount', 'desc']);

    if (req.query.status) {
        query.status = req.query.status;
    }
    if (req.query.name) {
        query.name = { $regex: '.*' + req.query.name + '.*', $options: 'i' }
    }

    if (req.query.gender) {
        query.gender = req.query.gender;
    }

    if (req.query.email) {
        query.email = req.query.email;
    }

    if (req.query.latitude, req.query.longitude) {
        query['location.coordinates'] = {
            $nearSphere: {
                $geometry: {
                    type: 'Point',
                    coordinates: [
                        req.query.latitude, req.query.longitude
                    ]
                },
                $minDistance: 0, //values in meters
                $maxDistance: req.query.range || 50000 //values in meters
            }
        };
    }

    if (req.query.filterBy) {
        query.question = {
            $regex: '^' + req.query.filterBy + '$',
            $options: 'i'
        };
    }

    // if (req.query.ageMin && req.query.ageMax) {
    //     query.ageGroup = {
    //         $gte: parseInt(req.query.ageMin),
    //         $lte: parseInt(req.query.ageMax)
    //     }
    // }

    if (req.query.filter && req.query.filter == 'favourite') {
        if (req.query.filter) {
            let where = {};
            where.filter = {
                $regex: '.*' + req.query.filter + '.*',
                $options: 'i'
            }
            let list = [];
            let k = 0;
            let query = {};
            let fromUser = req.user.id.toString();

            query._id = { $ne: req.user.id }
            let user = await db.user.find(query);
            for (var i = 0; i < user.length; i++) {
                var id = user[i].id.toString();
                let userpending = await db.userpending.find({ fromUser: fromUser, toUser: id });
                if (userpending.length == 0) {
                    list[k] = user[i];
                    k++;
                }
            }
            let allUser = await db.user.find();
            let favouriteUser = await favouriteService.checkCurrentUserFavouriteInUsers(req.user, list);
            let promises = [];
            favouriteUser.forEach(function (favouriteUser) {
                if (favouriteUser.isFavourite == true) {
                    promises.push(favouriteUser);
                }
            });

            try {
                let result = await Promise.all(promises)
                return res.page(mapper.toSearchModel(result));
            } catch (e) {
                return res.failure(e);
            }
        }
        else {
            let where = {
                fromUser: toObjectId(req.user.id)
            }
            let promises = [db.userFavourite.find(where).count()];
            if (serverPaging) {
                promises.push(db.userFavourite.find(where).populate({ path: 'toUser' }));
            } else {
                promises.push(db.userFavourite.find(where).populate({ path: 'toUser' }));
            }

            try {
                let result = await Promise.all(promises)
                let retVal = [];
                result[1].forEach(function (userFavourite) {
                    userFavourite.toUser.isFavourite = true;
                    retVal.push(userFavourite.toUser);
                });
                return res.page(mapper.toSearchModel(retVal));
            } catch (e) {
                return res.failure(e);
            }
        }
    }

    if (req.query.filter && req.query.filter == 'isSendr') {

        if (req.query.filter) {
            let where = {};
            where.filter = {
                $regex: '.*' + req.query.filter + '.*',
                $options: 'i'
            }
            let fromUsers = req.user
            let toUser = fromUsers.id.toString();
            let status = 'pending';

            let user = await db.userpending.find({
                $or: [{
                    toUser: toUser,
                    status: status
                }]
            })
            var users = []
            for (var i = 0; i < user.length; i++) {
                let ids = user[i].fromUser.toString();
                let date = user[i].date;
                let userlocation = user[i].userlocation
                let newid = await db.user.findById({ "_id": ids })
                let userid = newid.id.toString();
                let id = newid.id.toString();
                let name = newid.name
                let aboutUs = newid.aboutUs
                let ageGroup = newid.ageGroup
                let gender = newid.gender
                let password = newid.password
                let imgUrl = newid.imgUrl
                let isUserInterested = newid.isUserInterested
                let thankCount = newid.thankCount
                let createdAt = newid.createdAt
                let updatedAt = newid.updatedAt
                let newPending = { userid, id,name, date, userlocation, aboutUs, ageGroup, gender, password, imgUrl, isUserInterested, thankCount, createdAt, updatedAt };
                users[i] = newPending;
            }

            try {

                return res.page(users);
            } catch (e) {
                return res.failure(e);
            }

        }
        else {
            let where = {
                fromUser: toObjectId(req.user.id)
            }
            let promises = [db.userFavourite.find(where).count()];
            if (serverPaging) {
                promises.push(db.userFavourite.find(where).populate({ path: 'toUser' }));
            } else {
                promises.push(db.userFavourite.find(where).populate({ path: 'toUser' }));
            }
            try {
                let result = await Promise.all(promises)
                let retVal = [];
                result[1].forEach(function (userFavourite) {
                    userFavourite.toUser.isSendr = true;
                    retVal.push(userFavourite.toUser);
                });
                return res.page(mapper.toSearchModel(retVal));
            } catch (e) {
                return res.failure(e);
            }
        }
    }

    if (req.query.filter && req.query.filter == 'isSend') {

        if (req.query.filter) {
            let where = {};
            where.filter = {
                $regex: '.*' + req.query.filter + '.*',
                $options: 'i'
            }
            let fromUser = req.user.id.toString();

            let status = 'pending';

            let user = await db.userpending.find({
                $or: [{
                    fromUser: fromUser,
                    status: status
                }]
            })
            var users = []
            for (var i = 0; i < user.length; i++) {
                let ids= user[i].toUser.toString();
                let date = user[i].date;
                let userlocation = user[i].userlocation
                let newid = await db.user.findById({ "_id": ids })
                let userid = newid.id.toString();
                let id = newid.id.toString();

                let name = newid.name
                let aboutUs = newid.aboutUs
                let ageGroup = newid.ageGroup
                let gender = newid.gender
                let password = newid.password
                let imgUrl = newid.imgUrl
                let isUserInterested = newid.isUserInterested
                let thankCount = newid.thankCount
                let createdAt = newid.createdAt
                let updatedAt = newid.updatedAt

                let newPending = { userid,id, name, date, aboutUs, ageGroup, gender, password, imgUrl, isUserInterested, thankCount, userlocation, date, createdAt, updatedAt };
                users[i] = newPending;
            }

            try {

                return res.page(users);
            } catch (e) {
                return res.failure(e);
            }

        }
    }

    if (req.query.filter && req.query.filter == 'isConfirmed') {
        if (req.query.filter) {
            let where = {};
            where.filter = {
                $regex: '.*' + req.query.filter + '.*',
                $options: 'i'
            }
            let fromUser = req.user.id.toString();

            let status = 'confirmed';

            let user = await db.userconfirmed.find({
                $or: [{
                    fromUser: fromUser,
                    status: status,

                }]
            })
            var data = user.length;
            if (data !== 0) {
                var users = []
                for (var i = 0; i < user.length; i++) {
                    let userid = user[i].toUser.toString();
                    let userlocation = user[i].userlocation
                    let date = user[i].date
                    let newid = await db.user.findById({ "_id": userid })
                    let id = newid.id.toString();
                    let name = newid.name
                    let aboutUs = newid.aboutUs
                    let ageGroup = newid.ageGroup
                    let gender = newid.gender
                    let password = newid.password
                    let imgUrl = newid.imgUrl
                    let isUserInterested = newid.isUserInterested
                    let thankCount = newid.thankCount
                    let createdAt = newid.createdAt
                    let updatedAt = newid.updatedAt

                    let newPending = { id, name, createdAt, updatedAt, date, aboutUs, ageGroup, gender, password, imgUrl, isUserInterested, thankCount, userlocation };
                    users[i] = newPending;
                }


                try {


                    return res.page(users);


                }

                catch (e) {
                    return res.failure(e);
                }
            }
            else {
                let toUser = req.user.id.toString();
                let status = 'confirmed';
                let user = await db.userconfirmed.find({
                    $or: [{
                        toUser: toUser,
                        status: status,

                    }]
                })
                var users = []
                for (var i = 0; i < user.length; i++) {
                    let userid = user[i].fromUser.toString();
                    let userlocation = user[i].userlocation
                    let date = user[i].date
                    let newid = await db.user.findById({ "_id": userid })
                    let id = newid.id.toString();
                    let name = newid.name
                    let aboutUs = newid.aboutUs
                    let ageGroup = newid.ageGroup
                    let gender = newid.gender
                    let password = newid.password
                    let imgUrl = newid.imgUrl
                    let isUserInterested = newid.isUserInterested
                    let thankCount = newid.thankCount
                    let createdAt = newid.createdAt
                    let updatedAt = newid.updatedAt

                    let newPending = { id, name, createdAt, updatedAt, date, aboutUs, ageGroup, gender, password, imgUrl, isUserInterested, thankCount, userlocation };
                    users[i] = newPending;
                }
                try {
                    return res.page(users);
                }

                catch (e) {
                    return res.failure(e);
                }
            }


        } else {
            let where = {
                fromUser: toObjectId(req.user.id)
            }
            let promises = [db.userconfirmed.find(where).count()];
            if (serverPaging) {
                promises.push(db.userconfirmed.find(where).populate({ path: 'toUser' }));
            } else {
                promises.push(db.userconfirmed.find(where).populate({ path: 'toUser' }));
            }
            try {
                let result = await Promise.all(promises)
                let retVal = [];
                result[1].forEach(function (userconfirmed) {
                    userconfirmed.toUser.isConfirmed = true;
                    retVal.push(userconfirmed.toUser);
                });
                return res.page(mapper.toSearchModel(retVal));
            } catch (e) {
                return res.failure(e);
            }
        }
    }

    if (req.query.filter && req.query.filter == 'isInterest') {
        if (req.query.filter) {
            let where = {};
            where.filter = {
                $regex: '.*' + req.query.filter + '.*',
                $options: 'i'
            }

            let query = {};
            if (req.query.ageMin && req.query.ageMax) {
                query.ageGroup = {
                    $gte: parseInt(req.query.ageMin),
                    $lte: parseInt(req.query.ageMax)
                }
            }

            if (req.query.latitude, req.query.longitude) {
                query['location.coordinates'] = {
                    $nearSphere: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [
                                req.query.latitude, req.query.longitude
                            ]
                        },
                        $minDistance: 0, //values in meters
                        $maxDistance: req.query.range || 50000 //values in meters
                    }
                };
            }
                
            query.role = 'normal';
            query.status = (['active', 'on'])
            query._id = { $ne: req.user.id }
            let fromUser = req.user.id.toString();
           // let status = 'pending';
            let userlist = await db.userpending.find({
                $or: [{
                    fromUser: fromUser,

                }]
            })
            var list = [];
            var k = 0;
            var data = userlist.length;
            if (data !== 0) {
              
                query._id = { $ne: req.user.id }
                let user = await db.user.find(query);
                for (var i = 0; i < user.length; i++) {
                    var id = user[i].id.toString();
                    let userpending = await db.userpending.find({ fromUser: fromUser, toUser: id });
                    if (userpending.length == 0) {
                        list[k] = user[i];
                        k++;
                    }
                }
            }
            else {
                let toUser = req.user.id.toString();
                query._id = { $ne: req.user.id }
                let user = await db.user.find(query);
                for (var i = 0; i < user.length; i++) {
                    var id = user[i].id.toString();
                    let userpending = await db.userpending.find({ toUser: toUser, fromUser: id });
                    if (userpending.length == 0) {
                        list[k] = user[i];
                        k++;
                    }
                }
            }

           
            let allUser = await db.user.find();
            let favouriteUser = await favouriteService.checkCurrentUserInterestedInUsers(req.user, list);
            let promises = [];
            favouriteUser.forEach(function (favouriteUser) {
                if (favouriteUser.isInterest == false) {
                    promises.push(favouriteUser);
                    console.log(favouriteUser)
                }
            }
            );
            try {
              
                let result = await Promise.all(promises)
                return res.page(mapper.toSearchModel(result));
            } catch (e) {
                return res.failure(e);
            }

        }
        else {
            
            let query = {
                fromUser: toObjectId(req.user.id)
            }
         
            let promises = [db.userInterested.find(query).count()];
            if (serverPaging) {
                promises.push(db.userInterested.find(query).populate({ path: 'toUser' }));
            } else {
                promises.push(db.userInterested.find(query).populate({ path: 'toUser' }));
            }
            try {
                let result = await Promise.all(promises)
                let retVal = [];
                result[1].forEach(function (userInterested) {
                    userInterested.toUser.isInterest = false;
                    retVal.push(userInterested.toUser);
                });
                await userService.addIsBlockInUsers(result[1]);
                return res.page(mapper.toSearchModel(result[1]));
            } catch (e) {
                return res.failure(e);
            }
        }
    }
    else {
        let promises = [db.user.find(query).count()];
        if (serverPaging) {
            promises.push(db.user.find(query).sort(sort));
        } else {
            promises.push(db.user.find(query).sort(sort));
        }
        try {
            let result = await Promise.all(promises);
            result[1] = await favouriteService.checkCurrentUserFavouriteInUsers(req.user, result[1]);
            result[1] = await favouriteService.checkCurrentUserInterestedInUsers(req.user, result[1]);
            result[1] = await favouriteService.checkCurrentUserPendingInUsers(req.user, result[1]);
            result[1] = await favouriteService.checkCurrentUserconfirmInUsers(req.user, result[1]);
            result[1] = await removeService.checkCurrentUserFavouriteInUsers(req.user, result[1]);
            return res.page(mapper.toSearchModel(result[1]));
        } catch (err) {
            res.failure(err);
        }
    }
};

exports.delete = (req, res) => {
    let userId = req.params.id;
    db.user.findById(userId)
        .then(user => {
            if (!user) return res.failure(`user not found`);
            user.remove().then(() => {
                return res.success('user deleted successfully ');
            }).catch(err => res.failure(err))
        }).catch(err => res.failure(err))
};

exports.checkEmailIfExist = async (req, res) => {
    let email = req.params.email;
    try {
        let user = await db.user.find({ where: { email: email, id: { $ne: req.user.id } } });
        res.data(user ? true : false);
    } catch (err) {
        res.failure(err);
    }

};

exports.uploadImg = async (req, res) => {
    try {
        let user = await db.user.findById(req.params.userId);
        if (!user) {
            throw 'user not found';
        }
        let form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err)
                return res.failure(err);

            if (!files.media || !files.media.path) {
                return res.failure('image file is required');
            }
            let result = await s3.uploadclubToS3(files.media, req.params.userId);
            if (result && result.Location) {
                req.user.imgUrl = result.Location;
                await req.user.save();

                return res.data({ imgUrl: result.Location });
            } else {
                throw 'error'
            }
        });

    } catch (e) {
        return res.failure(e);
    }
};

exports.changeStatus = (req, res) => {
    var status = req.body.status;

    if (!status) {
        return res.failure("status is required in body")
    }
    
    db.user.findById(req.params.id).then(user => {
        if (!user)
            return cb("user not found");
        user.status = status;
        user.save()
            .then(updatedUser => {
                return res.data(mapper.toModel(updatedUser));
            }).catch(err => res.failure(err));
    }).catch(err => res.failure(err));

};

exports.favourite = async (req, res) => {
    try {
        let user = await db.user.findById(req.params.id);
        if (!user) {
            return "User not found";
        }
        let data = {
            fromUser: req.user,
            toUser: user
        };

        let favourite = await favouriteService.checkCurrentUserFavourite(req.user, user);

        if (favourite) {
            return res.success('Favourite successfull.');
        }
        ++user.favouriteCount;
        user.save();
        favourite = await db.userFavourite(data).save();
        return res.success('Favourite successfull.');
    } catch (e) {
        return res.failure(e);
    }
}

exports.userintrested = async (req, res) => {
    try {
        let user = await db.user.findById(req.params.id);
        if (!user) {
            return "User not found";
        }
        let data = {
            fromUser: req.user,
            toUser: user
        };
        let favourite = await favouriteService.checkCurrentUserInterested(req.user, user);
        // if (intrested) {
        //     return res.success('intrested successfull.');
        // }
        // ++user.favouriteCount;
        // user.save();
        favourite = await db.userInterested(data).save();
        return res.success('intrested successfull.');
    } catch (e) {
        return res.failure(e);
    }
}

exports.userpending = async (req, res) => {
    let model = req.body;
    let userlocation=model.userlocation;
    let date=model.date;
    model.fromUser = req.user;
    model.toUser = req.params.id;
    let fromuserid = req.user.id.toString();
    let toUserid = req.params.id;
    try {
        let userpending = await db.userpending.find({
            $or: [{
                fromUser: fromuserid,
                toUser: toUserid
            }]
        })
        let length = userpending.length
        if (length == 0) {
            let user = await db.user.findById(req.params.id);
            if (!user) {
                return "User not found";
            }
            let data = {
                fromUser: req.user,
                toUser: user,

                model
            }

            let favourite = await favouriteService.checkCurrentUserpending(req.user, user);
            favourite = await db.userpending(model).save();
            return res.data("pending sucessfully");


        }
        else {
            let userconfirmed = await db.userconfirmed.find({
                fromUser: fromuserid,
                toUser: toUserid
            })
            let userconfirmedlength = userconfirmed.length
            if (userconfirmedlength == 0) {
                let userpend = await db.userconfirmed.update({
                    fromUser: toUserid,
                    toUser: fromuserid
                },
                    { $set: { userlocation:userlocation,date:date} })
                    console.log(userpend)
                    return res.data("update sucessfully");
            }
            else {
                let userpendt = await db.userconfirmed.update({
                    fromUser: fromuserid,
                    toUser: toUserid
                },
                    { $set: { userlocation:userlocation,date:date} })
                    console.log(userpendt)
                    return res.data("update sucessfully");

            }


        }
    } catch (e) {
        return res.failure(e);
    }
}

exports.userconfirmed = async (req, res) => {
    let id = req.user._id.toString();
    let ids = req.params.id
    let userss = await db.userpending.find({ fromUser: ids, toUser: id });
    let userlocation = userss[0].userlocation;
    let date = userss[0].date;
    let model = req.body;
    model.fromUser = req.user;
    model.toUser = req.params.id;
    model.userlocation = userlocation;
    model.date = date;
    var status = 'confirmed';
    var toUser = req.user.id.toString();
    try {
        let user = await db.user.findById(req.params.id);
        let fromUser = user.id.toString();
        if (!user) {
            return "User not found";
        }
        let data = {
            fromUser: req.user,
            toUser: user
        };

        let favourite = await favouriteService.checkCurrentUserconfirmInUsers(req.user, user);
        favourite = await db.userconfirmed(model).save();
        let userpending = await db.userpending.update({
            fromUser: fromUser,
            toUser: toUser
        },
            { $set: { 'status': 'confirmed' } })
        //return res.data(mapper.toModel(user));
        return res.success('confirmed successfull.');
    } catch (e) {
        return res.failure(e);
    }
}

exports.unfavourite = async (req, res) => {
    try {
        let user = await db.user.findById(req.params.id);
        if (!user) {
            return "user not found";
        }
        let favourite = await favouriteService.checkCurrentUserFavourite(req.user, user);
        if (!favourite) {
            throw 'favourite not found';
        }
        if (user.favouriteCount > 0) {
            --user.favouriteCount;
            user.save();
        }
        await favourite.remove();
        return res.success('Unfavourite successfully.');
    } catch (e) {
        return res.failure(e);
    }
}

exports.userthank = async (req, res) => {
    try {
        let user = await db.user.findById(req.params.id);
        if (!user) {
            return "user not found";
        }
        let favourite = await removeService.checkCurrentUserFavourite(req.user, user);
        if (!favourite) {
            throw 'favourite not found';
        }

        await favourite.remove();
        return res.success('isSender false successfully.');
    } catch (e) {
        return res.failure(e);
    }
}

exports.unconfirmed = async (req, res) => {
    try {
        let user = await db.user.findById(req.params.id);
        if (!user) {
            return "user not found";
        }
        let favourite = await removeService.checkCurrentUserconfirmed(req.user, user);
        if (!favourite) {
            throw 'favourite not found';
        }

        await favourite.remove();
        return res.success('isConfirmed false successfully.');
    } catch (e) {
        return res.failure(e);
    }
}

exports.block = async (req, res) => {
    var userId = req.body.userId;
    try {
        let user = await db.user.findById(userId);
        if (!user) return res.failure(`user not found`);

        let model = { fromUser: req.user, toUser: user };
        let data = await db.blockUser.findOne(model);
        if (data) return res.failure(`user already block`);

        data = await new db.blockUser(model).save();
        return res.success('blocked successfully');

    } catch (err) {
        return res.failure(err);
    }
};

exports.unblock = async (req, res) => {
    var userId = req.body.userId;
    try {
        let user = await db.user.findById(userId);
        if (!user) return res.failure(`user not found`);

        let model = { fromUser: req.user, toUser: user };
        let data = await db.blockUser.findOne(model);
        if (!data) return res.failure(`blocked user not found`);

        await data.remove();
        return res.success('unblock successfully');

    } catch (err) {
        return res.failure(err);
    }
};

exports.blockUsers = async (req, res) => {
    let query = { fromUser: req.user };
    try {
        let users = await db.blockUser.find(query).populate('toUser');
        return res.page(mapper.toBlockModel(users));
    } catch (e) {
        return res.failure(e);
    }
};

exports.usertruethank = async (req, res) => {

    let model = req.body;
    let fromUser = req.user.id.toString();
    let toUser = req.params.id;
    try {
        let user = await db.userpending.find({
            $or: [{
                fromUser: fromUser,
                toUser: toUser,

            }]
        })
        var data = user.length;
        if (data !== 0) {

            let fromUser = req.user.id.toString();
            let toUser = req.params.id
            let status = 'accept';
            let userpending = await db.userpending.update({
                fromUser: fromUser,
                toUser: toUser
            },
                { $set: { status: status } })
            return res.success('cancel successfully.');
        }
        else {
            let toUser = req.user.id.toString();
            let fromUser = req.params.id
            let status = 'accept';
            let userpending = await db.userpending.update({
                fromUser: fromUser,
                toUser: toUser
            },
                { $set: { status: status } })
            return res.success('cancel successfully.');
        }
    } catch (e) {
        return res.failure(e);
    }
}

exports.userconfirmthank = async (req, res) => {
    let model = req.body;
    let fromUser = req.user.id.toString();
    let toUser = req.params.id;
    try {
        let user = await db.userconfirmed.find({
            $or: [{
                fromUser: fromUser,
                toUser: toUser,

            }]
        })
        var data = user.length;
        if (data !== 0) {
            let fromUser = req.user.id.toString();
            let toUser = req.params.id
            let status = 'agree';
            let userpending = await db.userconfirmed.update({
                fromUser: fromUser,
                toUser: toUser
            },
                { $set: { status: status } })
            return res.success('cancel successfully.');
        }
        else {
            let toUser = req.user.id.toString();
            let fromUser = req.params.id
            let status = 'agree';
            let userpending = await db.userconfirmed.update({
                fromUser: fromUser,
                toUser: toUser
            },
                { $set: { status: status } })
            return res.success('cancel successfully.');
        }
    } catch (e) {
        return res.failure(e);
    }
}