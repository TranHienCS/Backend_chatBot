const express = require('express');
const businessRoutes = express.Router();
const controller = require('../method/controller')
const Business = require('../model/trainingModel');

// Require Business model in our routes module
// Defined store route
businessRoutes.route('/add').post(async function (req, res) {
    let reqData = new Business(req.body);
    let isSuccess = await controller.trainingBot(reqData);
    if (isSuccess.sent) {
        // luu vao database
        controller.deleteDocumentDB(reqData.question);
        reqData.save()
            .then(() => res.status(200).json({ 'status': 'true', 'message': 'business in added successfully' }))
            .catch(() => res.status(400).json({ 'status': 'false', 'message': 'business not added successfully' }))
    }
    else {
        res.status(400).json({ 'status': 'false', 'message': 'can not send data to wit.ai' })
    }
})

//recieve message and bot reply
businessRoutes.route('/send').post(async (req, res) => {
    let data = await controller.reciveToReply(req.body.question);
    res.json(data);
})

// Gui intents va entities len client
businessRoutes.route('/').get(async function (req, res) {
    let data = await controller.sendIntentEntityToClient();
    res.json(data);
});

//gui {entity,intent,answer,default answer} khi nhap cau hoi
businessRoutes.route('/getEntity').post(async (req, res) => {
    let data = await controller.detectQuestionGetData(req.body.question);
    res.json(data);
})

//Create Entity on wit.ai
businessRoutes.route('/createEntity').post(async (req,res)=>{
    let id = req.body.id;
    let data = await controller.createEntity(id);
    res.json(data);
})

//Delete Entity on wit.ai
businessRoutes.route('/deleteEntity').delete(async (req,res)=>{
    let id = req.body.id;
    let data = await controller.deleteEntity(id);
    res.json(data);
})

businessRoutes.route('/createIntent').post(async (req,res)=>{

    let id = req.body.values;
    let data = await controller.createIntent(id);
    res.json(data);
})
//test
businessRoutes.route('/deleteIntent').delete(async (req, res) => {
    //let id = Object.keys(req.body)[0];
    let id = req.body.values;
    let data = await controller.deleteIntent(id);
    //console.log(data);
    res.json(data);
})

businessRoutes.route('/samples').get(async (req,res)=>{
    let data = await controller.getQuestion();
    res.json(data);
})

businessRoutes.route('/deleteSamples').delete(async (req,res)=>{
    let data = await controller.deleteSamples(req.body.questions);
    res.json(data);
})

// Defined edit route
businessRoutes.route('/edit/:id').get(function (req, res) {
    let id = req.params.id;
    Business.findById(id, function (err, business) {
        res.json(business);
    });
});

//  Defined update route
businessRoutes.route('/update/:id').post(function (req, res) {
    Business.findById(req.params.id, function (err, business) {
        if (!business)
            res.status(404).send("data is not found");
        else {
            business.fullname = req.body.fullname;
            business.age = req.body.age;
            business.email = req.body.email;

            business.save().then(business => {
                res.json('Update complete');
            })
                .catch(err => {
                    res.status(400).send("unable to update the database");
                });
        }
    });
});

// Defined delete | remove | destroy route
businessRoutes.route('/delete/:id').get(function (req, res) {
    Business.findByIdAndRemove({ _id: req.params.id }, function (err, business) {
        if (err) res.json(err);
        else res.json('Successfully removed');
    });
});

module.exports = businessRoutes;
