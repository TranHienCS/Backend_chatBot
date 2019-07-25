const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Business
let Business = new Schema({
  entities: {
    type: Object
  },
  params: {
    type: String
  },
  intent: {
    type: String
  },
  question: {
    type: String
  },
  default_answer: {
    type: String
  },
  answer: {
    type: String
  }
},
  {
    collection: 'business'
  });

module.exports = mongoose.model('Business', Business);