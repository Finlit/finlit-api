'use strict';
const async = require('async');
const _ = require('underscore');


exports.checkCurrentUserFavourite = async (user, blog) => {
    return checkCurrentUserPost(user, blog, 'postLike');
};

let checkCurrentUserPost = async (user, blog, namespace) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userFavourite = await db[namespace].findOne({
                user: user,
                blog: blog
            });
            return userFavourite ? resolve(userFavourite) : resolve(null);
        } catch (e) {
            return resolve(null);
        }
    });
}



exports.checkCurrentUserFavouriteInUsers = async (currentUser, blogs) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (blogs && blogs.length > 0) {
                blogs = await Promise.all(blogs.map(async (blog) => {
                    let favourite = await exports.checkCurrentUserFavourite(currentUser, blog);
                    blog.isLike = favourite ? true : false;
                    return blog;
                }));
            }
            return resolve(blogs);
        } catch (e) {
            return resolve(blogs);
        }
    });
};

let increaseCommentCount =  async (blogId) => {
    let blog = await db.blog.findById(blogId);
    ++blog.commentCount;
    blog.save();
 };
 exports.increaseCommentCount = increaseCommentCount;