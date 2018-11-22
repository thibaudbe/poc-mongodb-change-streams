const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const taskSchema = new Schema({
  task: { type: String },
  name: { type: String },
  type: { type: String },
})

module.exports = mongoose.model('Task', taskSchema)
