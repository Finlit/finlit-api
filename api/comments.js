'use strict';
let mapper = require('../mappers/comments');
const postService = require('../services/post');
const notificationService = require('../services/notification');

exports.create = async (req, res) => {
    try {
        if (!req.body.text) {
            throw 'text required';
        }
        if (!req.body.blogId) {
            throw 'blogId required';
        }
        var data = {
            text: req.body.text,
            blog: req.body.blogId,
            user: req.user,
           // tags: req.body.tags
        }

        let comment = await new db.postComment(data).populate({ path: 'blog'}).save();
        let postComment = await db.postComment.findById(comment.id).populate('blog').populate('user');
        postService.increaseCommentCount(req.body.blogId);
        // notificationService.toPostOwner('post', postComment);
        // notificationService.onComment('post', postComment);
        // notificationService.onTag('post', postComment);
        return res.data(mapper.toModel(postComment));
    } catch (e) {
        return res.failure(e);
    }
};

exports.search = async (req, res) => {

    let PageNo = Number(req.query.pageNo || 1);
    let pageSize = Number(req.query.pageSize);
    let toPage = (PageNo || 1) * (pageSize || 10);
    let fromPage = toPage - (pageSize || 10);
    let pageLmt = (pageSize || 10);
    let totalRecordsCount = 0;
    let serverPaging = req.query.serverPaging == "false" ? false : false;
    let where = {};

    if (req.query.blogId) {
        where.blog = req.query.blogId
    }

    let promises = [db.postComment.find(where).count()];
    if (serverPaging) {
        promises.push(db.postComment.find(where).populate('user').populate({ path: 'blog'}).sort([['createdAt', 1]]).skip(fromPage).limit(pageLmt));
    } else {
        promises.push(db.postComment.find(where).populate('user').populate({ path: 'blog'}).sort([['createdAt', 1]]));
    }

    try {
        let result = await Promise.all(promises)
        return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);

    } catch (e) {
        return res.failure(e);
    }
};


