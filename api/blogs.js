'use strict';

let mapper = require('../mappers/blog');
const updationScheme = require('../helpers/updateEntities');
const postService = require('../services/post');
const formidable = require('formidable');
const s3 = require('../providers/s3');


exports.create = async(req,res) => {
    let data = req.body;
    data.user = req.user;

    try {
       let blog = await db.blog(data).save();
       blog = await db.blog.findById(blog).populate('user');
       return res.data(mapper.toModel(blog));
    } catch(e){
        res.failure(e);
    }
}

exports.search = async(req,res) => {
    
    let PageNo = Number(req.query.pageNo || 1);
    let pageSize = Number(req.query.pageSize);
    let toPage = (PageNo || 1) * (pageSize || 10);
    let fromPage = toPage - (pageSize || 10);
    let pageLmt = (pageSize || 10);
    let totalRecordsCount = 0;
    let serverPaging = req.query.serverPaging == "false" ? false : true;

    let query = {};
    query._id = { $ne: req.user._id };    //without my user ,baki sre aan

    let promises = [db.blog.find(query).count()];
    if (serverPaging) {
        promises.push(db.blog.find(query).sort([['createdAt', -1]]).populate('user'));
    } else {
        promises.push(db.blog.find(query).sort([['createdAt', -1]]).populate('user'));
    }
    try {
        let result = await Promise.all(promises)
        result[1] = await postService.checkCurrentUserFavouriteInUsers(req.user, result[1]);
        return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);
    } catch (err) {
        res.failure(err);
    }
};

exports.like = async (req, res) => {
    try {
        let blog = await db.blog.findById(req.params.id);
        if (!blog) {
            return "Blog not found";
        }
        let data = {
            user: req.user,
            blog: blog
        };

        let favourite = await postService.checkCurrentUserFavourite(req.user, blog);

        if (favourite) {
            return res.success('Blog successfull.');
        }
        ++blog.likeCount;
       // blog.like = like;
        await blog.save();
        favourite = await db.postLike(data).save();
        return res.success('Blog successfull.');
    } catch (e) {
        return res.failure(e);
    }
}

exports.dislike = async(req, res) => {
    try {
        let blog = await db.blog.findById(req.params.id);
        if (!blog) {
            throw 'blog not found';
        };
        let like = await postService.checkCurrentUserFavourite(req.user, blog);
        if (!like) {
            throw 'like not found';
        }
        if (blog.likeCount > 0) {
            --blog.likeCount;
            blog.save();
        }
        await like.remove();
        return res.data(mapper.toModel(blog));
    } catch (e) {
        return res.failure(e);
    }
};

exports.uploadImg = async (req, res) => {
    try {
        let blog = await db.blog.findById(req.params.blogId);
        if (!blog) {
            throw 'blog not found';
        }

        let form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err)
                return res.failure(err);

            if (!files.image || !files.image.path) {
                return res.failure('image file is required');
            }
            let result = await s3.uploadclubToS3(files.image, req.params.blogId);
            if (result && result.Location) {
                blog.imgUrl = result.Location;
                await blog.save();

                return res.data({ imgUrl: result.Location });
            } else {
                throw 'error'
            }
        });

    } catch (e) {
        return res.failure(e);
    }
};

exports.update = async (req, res) => {
    let model = req.body;
   
    try {
        let blog = await db.blog.findById(req.params.id).populate('user');
        if (!blog) {
            return res.failure("blog not found");
        }
        blog = updationScheme.update(model, blog);
        blog = await blog.save();
        return res.data(mapper.toModel(blog));

    } catch (e) {
        return res.failure(e);
    }

}

exports.get = async (req, res) => {
    try {
        let blog = await db.blog.findById(req.params.id).populate('user');;
        return res.data(mapper.toModel(blog));

    } catch (e) {
        return res.failure(e);
    }

};

exports.delete = async (req, res) => {
    let blogId = req.params.id;

    db.blog.findById(blogId)
        .then(blog => {
            if (!blog) return res.failure(`blog not found`);
            blog.remove().then(() => {
                return res.success('blog deleted successfully ');
            }).catch(err => res.failure(err))
        }).catch(err => res.failure(err))
}