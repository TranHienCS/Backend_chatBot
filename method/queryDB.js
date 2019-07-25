const Business = require('../model/trainingModel');

module.exports={
    getAnswer(intent,entities){
        return Business.find({intent:intent,entities: entities},(err,docs)=>docs[0]);
    },

    getDefault_Answer(intent,param){
        return Business.find({intent:intent,params:param},(err,docs)=>docs[0]);
    },

    deleteDocument(question){
        Business.deleteOne({ question:question }, err => { if (err) console.log("err") });
    },

    async queryIntent(intent){
        return await Business.find({intent: intent},(err,docs)=>docs)
    },

    async queryEntity(id){
        let regex = new RegExp(id);
        return await Business.find({"params":{$regex: regex , $options: 'i'}},(err,docs)=>docs);
    }
}