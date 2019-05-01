'use strict'
var mapper = require('../mappers/userPlan');
const updationScheme = require('../helpers/updateEntities');
const moment = require('moment');

exports.create = async(req,res) => {
    let data = {};
    let plan = await db.plan.findById(req.body.planId);
    if(!plan){
        return res.failure('no plan found');
    }
    data.startDate = new Date().toISOString();
    data.user = req.user;
    data.plan = plan;

    if(plan.name == 'Popular'){
        data.expiryDate = moment(new Date()).add(30, 'days').toISOString();
    } else if(plan.name == 'High Demand'){
        data.expiryDate = moment(new Date()).add(365, 'days').toISOString();
    } else if(plan.name == 'Decent'){
        data.expiryDate = moment(new Date()).add(10, 'days').toISOString();
    }
    try {
       let userPlan = await db.userPlan(data).save();
       req.user.subscribed = true;
       await req.user.save();
       return res.data(mapper.toModel(userPlan));
    } catch(e){
        res.failure(e);
    }
}

exports.delete = (req, res) => {
    db.userPlan.findById(req.params.id)
        .then(userPlan => {
            if (!userPlan) return res.failure(`userPlan not found`);
            userPlan.remove().then(() => {
                return res.success('userPlan deleted successfully');
            }).catch(err => res.failure(err))
        }).catch(err => res.failure(err))
};

exports.update = async (req, res) => {
    let model = req.body;
    try {
        let userPlan = await db.userPlan.findById(req.params.id);
        if (!userPlan) {
            return res.failure("userPlan not found");
        }
        userPlan = updationScheme.update(model, userPlan);
        userPlan = await userPlan.save();
        return res.data(mapper.toModel(userPlan));

    } catch (e) {
        return res.failure(e);
    }
};

exports.get = async(req,res) => {
    try{
        let userPlan = await db.userPlan.findById(req.params.id);
        if(!userPlan){
            throw 'no userPlan found'
        }
        return res.data(mapper.toModel(userPlan));
    }catch(e){
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

    let promises = [db.userPlan.find(query).count()];
    if (serverPaging) {
        promises.push(db.userPlan.find(query).populate('plan').skip(fromPage).limit(pageLmt));
    } else {
        promises.push(db.userPlan.find(query).populate('plan'));
    }
    
    try {
        let result = await Promise.all(promises)
        return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);
    } catch (err) {
        res.failure(err);
    }
}

exports.getActivePlan = async(req,res) => {
    try {
        var where = {
            expiryDate : { $gte : new Date().toISOString() },
            user : req.user
        }
        let userPlan = await db.userPlan.findOne(where).populate('plan').populate('user');
        if(!userPlan){
            return res.failure('No active plan found');
        }
        return res.data(mapper.toModel(userPlan));
    } catch(e){
        res.failure(e);
    }
}
