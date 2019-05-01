'use strict';
const async = require('async');
var bcrypt = require('bcrypt-nodejs');
const _ = require('underscore');


exports.comparePassword = async(password, hash) => {
    return new Promise(async(resolve, reject) => {
        bcrypt.compare(password, hash, function(err, isPasswordMatch) {
            if (err) {
                return resolve(false);
            }
            return resolve(isPasswordMatch);
        });
    });
}

exports.setPassword = async(password) => {
    return new Promise(async(resolve, reject) => {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return resolve();
            }
            bcrypt.hash(password, salt, null, function(err, hash) {
                return resolve(hash);
            });
        });
    });
}

exports.checkCurrentUserFavourite = async (fromUser, toUser) => {
    return checkCurrentUserPost(fromUser, toUser, 'userFavourite');
};

exports.checkCurrentUserInterested = async (fromUser, toUser) => {
    return checkCurrentuserInterested(fromUser, toUser, 'userInterested');
};

exports.checkCurrentUserpending = async (fromUser, toUser) => {
    return checkCurrentUserpending(fromUser, toUser, 'userpending');
};

exports.checkCurrentUserconfirm = async (fromUser, toUser) => {
    return checkCurrentUserconfirm(fromUser, toUser, 'userconfirmed');
};
exports.checkCurrentUserthank = async (fromUser, toUser) => {
    return checkCurrentuserInterested(fromUser, toUser, 'userthank');
};

exports.checkCurrentUserReport = async (fromUser, toUser) => {
    return checkCurrentUserPost(fromUser, toUser, 'report');
};

let checkCurrentuserInterested = async (fromUser, toUser, namespace) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userInterested = await db[namespace].findOne({
                fromUser: fromUser,
                toUser: toUser
            });
            return userInterested ? resolve(userInterested) : resolve(null);
        } catch (e) {
            return resolve(null);
        }
    });
}

let checkCurrentUserpending = async (fromUser, toUser, namespace) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userpending = await db[namespace].findOne({
                fromUser: fromUser,
                toUser: toUser
            });
            return userpending ? resolve(userpending) : resolve(null);
        } catch (e) {
            return resolve(null);
        }
    });
}

let checkCurrentUserconfirm = async (fromUser, toUser,namespace) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userconfirmed = await db[namespace].findOne({
                fromUser: fromUser,
                toUser: toUser
            });
            return userconfirmed ? resolve(userconfirmed) : resolve(null);
        } catch (e) {
            return resolve(null);
        }
    });
}

let checkCurrentUserPost = async (fromUser, toUser, namespace) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userFavourite = await db[namespace].find({
                fromUser: fromUser,
                toUser: toUser
            });
            return userFavourite ? resolve(userFavourite) : resolve(null);
        } catch (e) {
            return resolve(null);
        }
    });
}

// exports.getuserfavourite = async (fromUser) =>{
//     return finduserfavourite(fromUser,'favouraite');
// }

// let finduserfavourite = (fromUser,namespace) => {
//     return new Promise(async (resolve,reject) => {
//         try{
//             let data = await db[namespace].find({
//                 fromUser:fromUser
//             });
//             return data ? resolve(data) : resolve(null);
//         }catch(e){
//             return resolve(null);
//         }
//     })
// }

exports.checkCurrentUserFavouriteInUsers = async (currentUser, users) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (users && users.length > 0) {
                users = await Promise.all(users.map(async (user) => {
                    let favourite = await exports.checkCurrentUserFavourite(currentUser, user);
                    user.isFavourite = favourite ? true : false;                   
                    
                    return user;
                    
                }));
            }
            return resolve(users);
        } catch (e) {
            return resolve(users);
        }
    });
};

exports.checkCurrentUserInterestedInUsers = async (currentUser, users) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (users && users.length > 0) {
                users = await Promise.all(users.map(async (user) => {
                    let interest = await exports.checkCurrentUserInterested(currentUser, user);
                    user.isInterest = interest ? true : false;                   
                    
                    return user;
                    
                }));
            }
            return resolve(users);
        } catch (e) {
            return resolve(users);
        }
    });
};

exports.checkCurrentUserPendingInUsers = async (currentUser, users) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (users && users.length > 0) {
                users = await Promise.all(users.map(async (user) => {
                    let sender = await exports.checkCurrentUserpending(currentUser, user);
                    user.isSendr = sender ? true : false;                   
                    
                    return user;
                    
                }));
            }
            return resolve(users);
        } catch (e) {
            return resolve(users);
        }
    });
};


exports.checkCurrentUserconfirmInUsers = async (currentUser, users) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (users && users.length > 0) {
                users = await Promise.all(users.map(async (user) => {
                    let sender = await exports.checkCurrentUserconfirm(currentUser, user);
                    user.isConfirmed = sender ? true : false;                   
                    
                    return user;
                    
                }));
            }
            return resolve(users);
        } catch (e) {
            return resolve(users);
        }
    });
};

exports.checkCurrentUserFavouriteInChats = async (currentUser, chats) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (chats && chats.length > 0) {
                for (const chat of chats) {
                    let participant = chat.participants.find(p => p.user.id != currentUser.id);
                    let favourite = await exports.checkCurrentUserFavourite(currentUser, participant.user);
                    participant.user.isFavourite = favourite ? true : false;
                    chat.participants.some(p => {
                        if (p.user.id == participant.user.id) {
                            p.user = participant.user;
                            return;
                        }
                    })
                }
                // chats = await Promise.all(chats.map(async (chat) => {
                //     let participant = chat.participants.find(p => p.user.id != currentUser.id);
                //     let favourite = await exports.checkCurrentUserFavourite(currentUser, participant.user);
                //     participant.user.isFavourite = favourite ? true : false;
                //     chat.participants.some(p => {
                //         if (p.user.id == participant.user.id) {
                //             p.user = participant.user;
                //             return;
                //         }
                //     })
                //     return chat;
                // }));
            }
            return resolve(chats);
        } catch (e) {
            return resolve(chats);
        }
    });
};

exports.checkCurrentUserThankInUsers = async (currentUser, users) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (users && users.length > 0) {
                users = await Promise.all(users.map(async (user) => {
                    let interest = await exports.checkCurrentUserthank(currentUser, user);
                    user.isThanks = interest ? true : false;                   
                    
                    return user;
                    
                }));
            }
            return resolve(users);
        } catch (e) {
            return resolve(users);
        }
    });
};

exports.addIsBlockInUsers = async(fromUser, users) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (users && users.length > 0) {
                users = await Promise.all(users.map(async(user) => {
                    user.isBlock = await checkIsBlock(fromUser, user, "userBlock");
                    return user
                }));
            }
            return resolve(users);
        } catch (e) {
            return resolve(users);
        }
    });
};

exports.getBlockedUsers = async(currentUser) => {
    return new Promise(async(resolve, reject) => {
        try {
            let where = {
                $or: [
                    { fromUser: currentUser },
                    { toUser: currentUser }
                ]
            }
            let blockedList = await db.blockUser.find(where);
            let allUsers = [];
            if (blockedList && blockedList.length) {
                let toUserBlocked = blockedList.map(item => item.toUser.toJSON());
                let fromUserBlocked = blockedList.map(item => item.fromUser.toJSON());
                Array.prototype.push.apply(allUsers, toUserBlocked);
                Array.prototype.push.apply(allUsers, fromUserBlocked);
                allUsers = _.uniq(allUsers);
                var retVal = _.filter(allUsers, function(item){ return item != currentUser._id.toJSON(); });
                return resolve(retVal);
            } else {
                return resolve([])
            }
        } catch (e) {
            return resolve([])
        }
    });
};

let checkIsBlock = async(fromUser, user, namespace) => {
    return new Promise(async(resolve, reject) => {
        try {

            let model = { fromUser: fromUser, toUser: user };
            let data = await db[namespace].findOne(model);

            return data ? resolve(data) : resolve(null);
        } catch (e) {
            return resolve(null);
        }
    });
};

exports.checkIsBlock = checkIsBlock;