'use strict'
var mapper = require('../mappers/question');
const updationScheme = require('../helpers/updateEntities');
exports.questions = async(req,res) => {
    let data = req.body;
    try {
       let question = await db.question(data).save();
       return res.data(mapper.toModel(question));
    } catch(e){
        res.failure(e);
    }
}

exports.delete = (req, res) => {
    let questionId = req.params.id;

    db.question.findById(questionId)
        .then(question => {
            if (!question) return res.failure(`question not found`);
            question.remove().then(() => {
                return res.success('question deleted successfully');
            }).catch(err => res.failure(err))
        }).catch(err => res.failure(err))
};


exports.update = async (req, res) => {
    let model = req.body;

    try {
        let question = await db.question.findById(req.params.id);
        if (!question) {
            return res.failure("question not found");
        }
        question = updationScheme.update(model, question);
        question = await question.save();
        return res.data(mapper.toModel(question));

    } catch (e) {
        return res.failure(e);
    }
};

exports.getquestion = async(req,res) => {
    try{
        let question = await db.question.findById(req.params.id);
        if(!question){
            throw 'no Question found'
        }
        return res.data(mapper.toModel(question));
    }catch(e){
        res.failure(e);
    }
}

exports.getAll = async(req,res) => {
    
    let PageNo = Number(req.query.pageNo || 1);
    let pageSize = Number(req.query.pageSize);
    let toPage = (PageNo || 1) * (pageSize || 10);
    let fromPage = toPage - (pageSize || 10);
    let pageLmt = (pageSize || 10);
    let totalRecordsCount = 0;
    let serverPaging = req.query.serverPaging == "false" ? false : true;

    let query = {
    // state: 'OK',
    // rnd: {
    //     $gte: Math.random()
    // }
    };

    
       var r = Math.floor(Math.random() * 10);
//var randomElement = db.myCollection.find(query).limit(1).skip(r);

    let sort = [];
    sort.push(['questionType', 'desc']);

    if (req.query.questionType) {
        query. questionType = req.query.questionType;
    }

    let promises = [db.question.find(query).count()];
    if (serverPaging) {
        promises.push(db.question.find(query).sort(sort).limit(13).skip(r));
    } else {
        promises.push(db.question.find(query).sort(sort));
    }
    
    try {
        let result = await Promise.all(promises)
        return res.page(mapper.toSearchModel(result[1]), PageNo, pageLmt, result[0]);
    } catch (err) {
        res.failure(err);
    }
}