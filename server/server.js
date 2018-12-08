const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const api = require('./routes/api')

require('dotenv').config({ path: '../.env' })

const appPort = process.env.PORT
const mongoPort = process.env.MONGO_PORT
const mongoHost = process.env.MONGO_HOST
const mongoUser = process.env.MONGO_USER
const mongoPass = process.env.MONGO_PASS
const mongoDb = process.env.MONGO_DATABASE
const mongoUrl = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDb}`

const app = express()
const server = require('http').createServer(app)
const socketIo = require('socket.io')(server)

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/api', api)

const options = { useNewUrlParser: true }

// Async connection
// async function runDb() {
//   try {
//     await mongoose.connect(mongoUrl, options)
//   } catch (error) {
//     throw error
//   }
// }
// runDb()

mongoose.connect(mongoUrl, options, (err) => {
  if (err) throw err
})

const db = mongoose.connection

db.once('open', () => {
  console.log('> mongodb opened')

  server.listen(appPort, () => {
    console.log(`Node server running on port ${appPort}`)
  })

  const taskCollection = db.collection('tasks')
  const changeStream = taskCollection.watch()

  socketIo.on('connect', (socket) => {
    console.info('🖥', '→ 1 client connected')

    changeStream.on('change', (change) => {
      switch (change.operationType) {
        case 'delete':
        case 'insert':
        case 'update':
        case 'replace':
          socket.emit('task', { type: change.operationType, data: change.fullDocument || change.documentKey })
          break;
        default:
          console.log('unhandled operationType', change.operationType, change.fullDocument || change.documentKey)
          break;
      }
    })

    socket.on('disconnect', () => {
      console.info('🖥', '← 1 client disconnected')
      socket.removeAllListeners()
    })
  })

})
