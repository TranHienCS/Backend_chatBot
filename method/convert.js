module.exports = {
  /////////////////////////////////////////////////////
  // dataReq={
  //   "entities": {
  //     "action": "book",
  //     "place": "Las Vegas"
  //   },
  //   "params": "action,place",
  //   "intent": "Question",
  //   "question": "can you book a room hotel in Las Vegas",
  //   "default_answer": "No",
  //   "answer": "YES, I can"
  // }
  //==>
  // [{
  //   "text": "can you book a room hotel in Las Vegas",
  //   "entities": [
  //     {
  //       "entity": "intent",
  //       "value": "flight_request"
  //     },
  //     {
  //       "entity": "wit$location",
  //       "start": 17,
  //       "end": 20,
  //       "value": "sfo"
  //     }
  //   ]
  // }]
  /////////////////////////////////////////
  //Chuyen doi data tu client de gui len wit.ai
  convertData(dataReq) {
    let dataRes = {};
    dataRes.entities = [];
    let intent = {
      "entity": "intent",
      "value": dataReq.intent
    }
    dataRes.entities.push(intent);
    dataRes.text = dataReq.question.trim();
    for (let i = 0; i < Object.keys(dataReq.entities).length; i++) {
      let key = Object.keys(dataReq.entities)[i];
      let entity = key;
      let value = dataReq.entities[key];
      console.log(value);
      let arrVal=[];
      if(value.split(',').length>1){
        arrVal = value.split(',');
        for(let i =0;i<arrVal.length;i++){
          let finalEntity ={};
          let startIdx = dataReq.question.indexOf(arrVal[i]);
          finalEntity.value = arrVal[i];
          finalEntity.start = startIdx;
          finalEntity.end = arrVal[i].length + startIdx;
          finalEntity.entity = entity;
          dataRes.entities.push(finalEntity);
        }
      }
      else{
      let finalEntity = {};
      let startIdx = dataReq.question.indexOf(value);
      //let endIdx = startIdx + value.length;
      finalEntity.value = value;
      finalEntity.start = startIdx;
      finalEntity.end = value.length + startIdx;
      finalEntity.entity = entity;
      dataRes.entities.push(finalEntity);
      }
    }
    //dataRes = [dataRes];
    //console.log(JSON.stringify(dataRes));
    console.log(dataRes);
    return dataRes;
  },

  convertToIntent(data){
    if(data['intent'] !== undefined)
     return data.intent[0].value;
  },

  //=>{"nameEntity":"valueEnity"}
  //input: data tu api wit khi gui cau hoi len
  convertToEntity(data){
    let obj = {};
    let entites = Object.keys(data);
    let idx = entites.indexOf(entites);
    entites.splice(idx,1);
    entites.forEach((el)=>{
      obj[el]=data[el][0].value;
    })
    return obj;
  },

  isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
  },

  // [
  //   {
  //       "text": "hi",
  //       "entities": [
  //           {
  //               "entity": "intent",
  //               "value": "greeting"
  //           }
  //       ]
  //   }
  // ]
  convertSamples(dataReq){
    let data=[];
    
    dataReq.forEach((el,idx)=>{
      let dataRes ={};
      let arrEntities = [];
      dataRes.text = el.text;
      dataRes.params = {};
      let block = {};
      let entities = el.entities;
      entities.forEach((e,id)=>{
        if(e.entity == "intent"){
          dataRes.intent = e.value;
        }
        else{
          arrEntities.push(e.entity);
          block[e.entity] = e.value;
         ;
        }
      })
      dataRes.params=block;
      dataRes.entities=arrEntities.toString();
      data.push(dataRes);
    })
    return data;
  }
}

