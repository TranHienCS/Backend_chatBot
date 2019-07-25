const WitApi = require("../method/index");
const queryDb = require("../method/queryDB");
const method = require("../method/convert");


module.exports = {
    newBusiness(data){
        let result =  new Bussiness(data);
        return result;
    },

    async detectQuestionGetData(question) {
        const wit = new WitApi();
        //get data from wit.ai by Question
        let blockData = await wit.detectQuestion(question);
        blockData = blockData.entities;
        if (await method.isEmpty(blockData)) return {}
        //convert get intent:String
        let intent = await method.convertToIntent(blockData);
        //convert get enitities:{entity: valueEntity}
        let objEntity = await method.convertToEntity(blockData);
        //convet to param: [entity]
        let params = Object.keys(objEntity).toString();
        //query database get Answer
        let Answer = '';
        let defaultAnswer = '';
        let Ans = await queryDb.getAnswer(intent, objEntity);
        if (Ans.length) {
            Answer = Ans[0].answer;
            defaultAnswer = Ans[0].default_answer;
        }
        else {
            //query database get default Answer
            let defaultAns = await queryDb.getDefault_Answer(intent, params);
            if (defaultAns.length) {
                defaultAnswer = defaultAns[0].default_answer;
            }
        }
        let dataRes = { intent: intent, listEn: objEntity, answer: Answer, default_ans: defaultAnswer };
        return dataRes;
    },

    async sendIntentEntityToClient() {
        const wit = new WitApi();
        //get list enitities from wit.ai
        let listEntities = [];
        listEntities = await wit.entities();
        let dataRes = {};
        if (!listEntities.error) {
            listEntities.splice(listEntities.indexOf('intent'), 1);

            //remove default entities by regular expression
            let regexp = /^wit/
            listEntities = listEntities.filter(el => !regexp.test(el))
            //get list intent from wit.ai
            let infoIntent = await wit.infoEntity('intent');
            let listIntent = [];
            //filter to array intent
            infoIntent.values.forEach(el => listIntent.push(el.value));
            dataRes = { intent: listIntent, entities: listEntities }
        }
        return dataRes;
    },

    //recive message and reply answer
    async reciveToReply(message) {
        let defaultReply = "I don't understand!";
        let botAnswer = await this.detectQuestionGetData(message);
        if (await method.isEmpty(botAnswer)) return defaultReply;
        //If answer empty reply default_answer
        //If bolt is empty reply i don't understand
        if (botAnswer.answer == '') {
            if (botAnswer.default_ans == '')
                return defaultReply;
            else return botAnswer.default_ans;
        }
        else {
            return botAnswer.answer;
        }
    },

    async trainingBot(dataReq) {
        const wit = new WitApi();
        let dataRes = method.convertData(dataReq);
        let text = dataRes.text;
        let entities = dataRes.entities;
        return await wit.trainingQuestion(text, entities);
    },

    async deleteDocumentDB(question) {
        await queryDb.deleteDocument(question);
    },

    //Create Entity
    //Create Entiti on wit.ai
    async createEntity(id) {
        const wit = new WitApi();
        return await wit.createEntity(id, []);
    },

    //delete Entity on wit.ai
    async deleteEntity(id) {
        let success = [];
        let fail = [];
        if (!Array.isArray(id)) id = [id];
        for (let i = 0; i < id.length; i++) {
            let data = await queryDb.queryEntity(id[i]);
            if (data.length == 0) {
                let wit = new WitApi();
                let bool = await wit.deleteEntity(id[i]);
                if (!bool.error)
                    success.push(id[i]);
            }
            else {
                fail.push(id[i]);
            }
        }
        let result = {};
        result.success = success.toString();
        result.fail = fail.toString();
        return result;
    },

    async createIntent(id) {
        const wit = new WitApi();
        return await wit.createIntent(id);
    },

    async deleteIntent(id) {
        let success = [];
        let fail = [];
        let result = {};
        result.success = [];
        result.fail = [];
        if (!Array.isArray(id)) id = [id];
        for (let i = 0; i < id.length; i++) {
            let data = await queryDb.queryIntent(id[i]);
            if (data.length == 0) {
                let wit = new WitApi();
                bool = await wit.deleteIntent(id[i]);
                success.push(id[i]);
            }
            else {
                fail.push(id[i]);
            }
        }
        result.success = success.toString();
        result.fail = fail.toString();
        return result;
    },

    async getQuestion() {
        const wit = new WitApi();
        dataQuestion = await wit.questions();
        data = await method.convertSamples(dataQuestion);
        return data;
    },

    async deleteSamples(samples) {
        const wit = new WitApi();
        let dataDelete = [];
        if (!Array.isArray(samples)) samples = [samples];
        for (let i = 0; i < samples.length; i++) {
            let elementDelete = {};
            elementDelete.text = samples[i];
            dataDelete.push(elementDelete);
        }
        let result = await wit.deleteQuestion(dataDelete);
        if(result.sent){
            dataDelete.forEach(async el=>await queryDb.deleteDocument(el.text))
        }
        return result;
    }

}