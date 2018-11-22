const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const api = require('./routes/api')
// const pusherRoute = require('./routes/pusher')
// const Pusher = require('pusher')

require('dotenv').config()

// const pusher = new Pusher({
//   appId      : process.env.PUSHER_APP_ID,
//   key        : process.env.PUSHER_APP_KEY,
//   secret     : process.env.PUSHER_APP_SECRET,
//   cluster    : process.env.PUSHER_APP_CLUSTER,
//   encrypted  : true,
// })
// const channel = 'tasks'

const app = express()

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/api', api)
// app.use('/pusher', pusherRoute)

mongoose.connect(process.env.MONGODB_URL, function(err) {
  if (err) {
    console.log(err)
  }
})

const db = mongoose.connection

db.on('error', console.error.bind(console, 'Connection Error:'))

db.once('open', () => {
  app.listen(9000, () => {
    console.log('Node server running on port 9000')
  })

  const taskCollection = db.collection('tasks')
  const changeStream = taskCollection.watch()

  changeStream.on('change', (change) => {
    if(change.operationType === 'insert') {
      console.log('> [INSERT]', change.fullDocument)
      // pusher.trigger(
      //   channel,
      //   'inserted',
      //   {
      //     _id: task._id,
      //     name: task.name,
      //     task: task.task,
      //     type: task.type,
      //   }
      // )
    } else if(change.operationType === 'delete') {
      console.log('> [DELETED]', change.documentKey)
      // pusher.trigger(
      //   channel,
      //   'deleted',
      //   change.documentKey._id
      // )
    }
  })
})
