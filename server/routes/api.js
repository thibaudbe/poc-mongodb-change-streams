const Task  = require('../models/task')
const express = require('express')
const router = express.Router()

router.post('/new', (req, res) => {
  Task.create({
    name: req.body.name,
    task: req.body.task,
    type: req.body.type
  }, (err, task) => {
    if (err) {
      console.log('> [CREATE-ROUTE] Error: ' + err)
      res.status(500).send('Error')
    } else {
      console.log('> [CREATE-ROUTE]', task)
      res.status(200).json(task)
    }
  })
})

router.delete('/:id', (req, res) => {
  Task.findById(req.params.id, (err, task) => {
    if (err) {
      console.log('> [DELETE-ROUTE] Error: ' + err)
      res.status(500).send('Error')
    } else if (task) {
      console.log('> [DELETE-ROUTE]', req.params.id)
      task.remove(() => {
        res.status(200).json(task)
      })
    } else {
      console.log('> [DELETE-ROUTE] Not found')
      res.status(404).send('Not found')
    }
  })
})

router.get('/', (_req, res) => {
  Task.find({}, (err, task) => {
    if (err) {
      console.log('> [GET-ROUTE] Error: ' + err)
      res.status(500).send('Error')
    } else if (task) {
      console.log('> [GET-ROUTE]', task)
      res.status(200).json(task)
    }
  })
})

module.exports = router
