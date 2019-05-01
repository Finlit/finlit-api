'use strict'
var mapper = require('../mappers/plan');
const updationScheme = require('../helpers/updateEntities');

exports.create = async(req,res) => {
    let data = req.body;
    try {
       let plan = await db.plan(data).save();
       return res.data(mapper.toModel(plan));
    } catch(e){
        res.failure(e);
    }
}

exports.delete = (req, res) => {
    db.plan.findById(req.params.id)
        .then(plan => {
            if (!plan) return res.failure(`plan not found`);
            plan.remove().then(() => {
                return res.success('plan deleted successfully');
            }).catch(err => res.failure(err))
        }).catch(err => res.failure(err))
};

exports.update = async (req, res) => {
    let model = req.body;
    try {
        let plan = await db.plan.findById(req.params.id);
        if (!plan) {
            return res.failure("plan not found");
        }
        plan = updationScheme.update(model, plan);
        plan = await plan.save();
        return res.data(mapper.toModel(plan));

    } catch (e) {
        return res.failure(e);
    }
};

exports.get = async(req,res) => {
    try{
        let plan = await db.plan.findById(req.params.id);
        if(!plan){
            throw 'no plan found'
        }
        return res.data(mapper.toModel(plan));
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

    let promises = [db.plan.find(query).count()];
    if (serverPaging) {
        promises.push(db.plan.find(query).skip(fromPage).limit(pageLmt));
    } else {
        promises.push(db.plan.find(query));
    }
    
    try {
        let result = await Promise.all(promises)
        return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);
    } catch (err) {
        res.failure(err);
    }
}