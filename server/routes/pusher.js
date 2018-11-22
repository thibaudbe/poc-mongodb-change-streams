const express = require('express')
const router = express.Router()
const Pusher = require('pusher')

require('dotenv').config()

const pusher = new Pusher({
  appId      : process.env.PUSHER_APP_ID,
  key        : process.env.PUSHER_APP_KEY,
  secret     : process.env.PUSHER_APP_SECRET,
  cluster    : process.env.PUSHER_APP_CLUSTER,
  encrypted  : true,
})

router.post('/auth', (req, res) => {
  console.log('router.post /pusher/auth', req.body)
  var socketId = req.body.socket_id
  var channel = req.body.channel_name
  
  if (/^presence-/.test(channel)) {
    let timestamp = new Date().toISOString()
    let presenceData = {
      user_id: `user-${timestamp}`,
      user_info: {
        name: 'Rus',
        twitter_id: '@rus',
      },
    }
    var auth = pusher.authenticate(socketId, channel, presenceData)
    res.send(auth)
  } else {
    var auth = pusher.authenticate(socketId, channel)
    res.send(auth)
  }
})

module.exports = router
