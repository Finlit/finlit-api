"use strict";

exports.create = async (req, res) => {

    let user = await db.user.findById(req.params.id);

    if (!user) {
        return res.failure(`user not found`);
    } 

    let model = {
        fromUser: req.user,
        toUser: user
        
    }
    try {
        let report = await db.report.find(model);;
        if (report.length > 0)
            return res.failure('You already reported');

            if(user.reportCount == 9){
                user.status = 'inactive';
            }
            
        report = await new db.report(model).save();
        ++user.reportCount;
        await user.save();
        return res.success('reported successfully');
    } catch (e) {
        return res.failure(e);
    }
};