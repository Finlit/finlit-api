'use strict';
const async = require('async');
const _ = require('underscore');


exports.checkCurrentUserFavourite = async (fromUser, toUser) => {
    return checkCurrentUserPost(fromUser, toUser, 'userpending');
};

exports.checkCurrentUserconfirmed = async (fromUser, toUser) => {
    return checkCurrentUserPost(fromUser, toUser, 'userconfirmed');
};

let checkCurrentUserPost = async (fromUser, toUser, namespace) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userFavourite = await db[namespace].findOne({
                fromUser: fromUser,
                toUser: toUser
            });
            return userFavourite ? resolve(userFavourite) : resolve(null);
        } catch (e) {
            return resolve(null);
        }
    });
}



exports.checkCurrentUserFavouriteInUsers = async (currentUser, users) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (users && users.length > 0) {
                users = await Promise.all(users.map(async (user) => {
                    let favourite = await exports.checkCurrentUserFavourite(currentUser, user);
                    user.isSendr = favourite ? false : true;
                    return user;
                }));
            }
            return resolve(users);
        } catch (e) {
            return resolve(users);
        }
    });
};

