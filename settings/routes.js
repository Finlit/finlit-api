'use strict';
const fs = require('fs');
const apiRoutes = require('../helpers/apiRoute');
const loggerConfig = require('config').get('logger');
var auth = require('../middlewares/authorization');

module.exports.configure = (app) => {
    let title = 'finlit API'

    app.get('/', (req, res) => {
        res.render('index', {
            title: title
        });
    });

    app.get('/api', (req, res) => {
        res.render('index', {
            title: title
        });
    });

    app.get('/swagger', (req, res) => {
        res.writeHeader(200, {
            "Content-Type": "text/html"
        });
        fs.readFile('./public/swagger/index.html', null, function (err, data) {
            if (err) {
                res.writeHead(404);
            }
            res.write(data);
            res.end();
        });
    });

    let api = apiRoutes(app);

    api.model('users')
        .register([{
            action: 'POST',
            method: 'signin',
            url: '/signin',
        }, {
            action: 'POST',
            method: 'signUp',
            url: '/signup',
        }, {
            action: 'POST',
            method: 'verification',
            url: '/verify'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            filter: auth.requiresToken
        }, {
            action: 'GET',
            method: 'search',
            filter: auth.requiresToken
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
            filter: auth.requiresToken
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'resend',
            url: '/forgetPassword'
        }, {
            action: 'POST',
            method: 'uploadImg',
            url: '/upload/image/:userId',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'changeStatus',
            url: '/change/status/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'favourite',
            url: '/favourite/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'userintrested',
            url: '/userintrested/:id',
            filter: auth.requiresToken
        },{
            action: 'POST',
            method: 'usertruethank',
            url: '/usertruethank/:id',
            filter: auth.requiresToken
        }, 
        ,{
            action: 'POST',
            method: 'userconfirmthank',
            url: '/userconfirmthank/:id',
            filter: auth.requiresToken
        },{
            action: 'POST',
            method: 'userconfirmed',
            url: '/userconfirmed/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'userthank',
            url: '/userthank/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'userpending',
            url: '/userpending/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'unconfirmed',
            url: '/unconfirmed/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'unfavourite',
            url: '/unfavourite/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'block',
            url: '/update/block',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'unblock',
            url: '/update/unblock',
            filter: auth.requiresToken
        }, {
            action: 'GET',
            method: 'blockUsers',
            url: '/block/search',
            filter: auth.requiresToken
        },{
            action: 'GET',
            method: 'withoutBlockUser',
            url: '/list/search',
            filter: auth.requiresToken
        }]);

    api.model('questions')
        .register([{
            action: 'POST',
            method: 'questions'
        }, {
            action: 'GET',
            method: 'getquestion',
            url: '/:id'
        }, {
            action: "GET",
            method: 'getAll',
            filter: auth.requiresToken
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            filter: auth.requiresToken
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
            filter: auth.requiresToken
        }])

    api.model('plans')
        .register([{
            action: 'POST',
            method: 'create'
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id'
        }, {
            action: "GET",
            method: 'search'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id'
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
        }]);

    api.model('blogs')
        .register([{
            action: 'POST',
            method: 'create',
            filter: auth.requiresToken
        }, {
            action: "GET",
            method: 'search',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'like',
            url: '/like/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'dislike',
            url: '/dislike/:id',
            filter: auth.requiresToken
        }, {
            action: 'POST',
            method: 'uploadImg',
            url: '/upload/image/:blogId',
            filter: auth.requiresToken
        },{
            action: 'PUT',
            method: 'update',
            url: '/:id',
            filter: auth.requiresToken
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id'
        }]);

    api.model('comments')
        .register([{
            action: 'POST',
            method: 'create',
            filter: auth.requiresToken
        }, {
            action: 'GET',
            method: 'search',
            filter: auth.requiresToken
        }]);

    api.model('userPlans')
        .register([{
            action: 'POST',
            method: 'create',
            filter: auth.requiresToken
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id'
        }, {
            action: "GET",
            method: 'search'
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id'
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
        }, {
            action: 'GET',
            method: 'getActivePlan',
            url: '/active/current',
            filter: auth.requiresToken
        }]);

    api.model('chats')
        .register([{
            action: 'POST',
            method: 'create',
            filter: auth.requiresToken
        }, {
            action: 'GET',
            method: 'search',
            filter: auth.requiresToken
        }, {
            action: 'PUT',
            method: 'block',
            url: '/block/:id',
            filter: auth.requiresToken
        }, {
            action: 'DELETE',
            method: 'delete',
            url: '/:id',
            filter: auth.requiresToken
        }, {
            action: 'PUT',
            method: 'unblock',
            url: '/unblock/:id',
            filter: auth.requiresToken
        }, {
            action: 'PUT',
            method: 'incUnreadCount',
            url: '/incUnreadCount/:id',
            filter: auth.requiresToken
        }, {
            action: 'PUT',
            method: 'setZeroUnreadCount',
            url: '/setZeroUnreadCount/:id',
            filter: auth.requiresToken
        }])

    api.model('notifications')
        .register([{
            action: 'GET',
            method: 'search',
            filter: auth.requiresToken
        }]);

    api.model('reports')
        .register([{
            action: 'POST',
            method: 'create',
            url: '/:id',
            filter: auth.requiresToken
        }]);

}