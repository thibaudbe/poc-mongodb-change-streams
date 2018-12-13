const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const jackrabbit = require('jackrabbit')

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

// Asynchronous connection
// async function runDb() {
//   try {
//     await mongoose.connect(mongoUrl, options)
//   } catch (error) {
//     throw error
//   }
// }
// runDb()

// Synchronous connection
mongoose.connect(mongoUrl, options, (err) => {
  if (err) throw err
})

const rabbitUser = process.env.RABBITMQ_DEFAULT_USER
const rabbitPass = process.env.RABBITMQ_DEFAULT_PASS
const rabbitVhost = process.env.RABBITMQ_DEFAULT_VHOST
const rabbitUrl = `amqp://${rabbitUser}:${rabbitPass}@localhost${rabbitVhost}`

const rabbit = jackrabbit(rabbitUrl)

server.listen(appPort, () => {
  console.log(`Node server running on port ${appPort}`)
})

socketIo.on('connect', (socket) => {
  console.info('🖥', ' → 1 client connected')

  const queueName = 'taskQueue'
  const exchange = rabbit.default()
  // enable "durable", RabbitMQ will never lose the queue
  const taskQueue = exchange.queue({ name: queueName, durable: false })
  taskQueue.consume(onMessage, { noAck: true })

  socket.on('disconnect', () => {
    console.info('🖥', ' ← 1 client disconnected')
    socket.removeAllListeners()
  })
})

function onMessage(message) {
  console.log(' [x] Received', message)
  socketIo.emit('task', message)
}
