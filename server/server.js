const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
// https://www.npmjs.com/package/amqp
const amqp = require('amqplib/callback_api')

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

const rabbitUser = process.env.RABBITMQ_DEFAULT_USER
const rabbitPass = process.env.RABBITMQ_DEFAULT_PASS
const rabbitVhost = process.env.RABBITMQ_DEFAULT_VHOST
const rabbitUrl = `amqp://${rabbitUser}:${rabbitPass}@localhost${rabbitVhost}`

amqp.connect(rabbitUrl, (err, conn) => {
  if (err) throw err

  conn.createChannel((err, ch) => {
    if (err) throw err

    const q = 'taskQueue'
    // enable "durable", RabbitMQ will never lose the queue
    ch.assertQueue(q, { durable: false })
    // pair dispatch
    // ch.prefetch(1)

    server.listen(appPort, () => {
      console.log(`Node server running on port ${appPort}`)
    })

    socketIo.on('connect', (socket) => {
      console.info('🖥', '→ 1 client connected')

      ch.consume(q, (msg) => {
        // socket.emit('task', msg.content.toJSON())
        socket.emit('task', { type: 'test', data: msg.content.toString() })
        console.log(' [x] Received %s', msg.content.toString())
      }, { noAck: true })

      socket.on('disconnect', () => {
        console.info('🖥', '← 1 client disconnected')
        socket.removeAllListeners()
      })
    })
  })
})
