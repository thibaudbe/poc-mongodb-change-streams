// https://www.npmjs.com/package/amqp
const amqp = require('amqplib/callback_api')
const mongoose = require('mongoose')

require('dotenv').config({ path: '../.env' })

const appPort = process.env.PORT
const mongoPort = process.env.MONGO_PORT
const mongoHost = process.env.MONGO_HOST
const mongoUser = process.env.MONGO_USER
const mongoPass = process.env.MONGO_PASS
const mongoDb = process.env.MONGO_DATABASE
const mongoUrl = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDb}`

const options = { useNewUrlParser: true }

mongoose.connect(mongoUrl, options, (err) => {
  if (err) throw err
})

const db = mongoose.connection

const rabbitUser = process.env.RABBITMQ_DEFAULT_USER
const rabbitPass = process.env.RABBITMQ_DEFAULT_PASS
const rabbitVhost = process.env.RABBITMQ_DEFAULT_VHOST
const rabbitUrl = `amqp://${rabbitUser}:${rabbitPass}@localhost${rabbitVhost}`

db.once('open', () => {
  console.log('> mongodb opened')

  amqp.connect(rabbitUrl, (err, conn) => {
    if (err) throw err

    conn.createChannel((err, channel) => {
      if (err) throw err

      const q = 'taskQueue'

      // enable "durable", RabbitMQ will never lose the queue
      channel.assertQueue(q, { durable: false })

      const taskCollection = db.collection('tasks')
      const changeStream = taskCollection.watch()

      changeStream.on('change', (change) => {
        const payload = { type: change.operationType, data: change.fullDocument || change.documentKey }
        const content = Buffer.from(JSON.stringify(payload))

        switch (change.operationType) {
          case 'delete':
          case 'insert':
          case 'update':
          case 'replace':
            // enable "persistent", RabbitMQ will never lose the queue
            channel.sendToQueue(q, content, { persistent: false })
            console.log(` [x] Sent "${payload.type}: ${payload.data._id}"`)
            break;
          default:
            console.log('unhandled operationType', change.operationType, change.fullDocument || change.documentKey)
            break;
        }
      })
    })
  })
})
