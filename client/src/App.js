import React, { Component } from 'react'
import * as io from 'socket.io-client'
import './App.css'

const SERVER_URL = 'http://localhost:9000'
const API_URL = SERVER_URL + '/api/'

class App extends Component {
  socket = io.connect(SERVER_URL)

  constructor(props) {
    super(props)
    this.state = {
      tasks: [],
      task: '',
      name: ''
    }
  }

  componentDidMount() {
    this.syncTasks()

    this.socket.on('task', ({ type, data }) => {
      console.log(' [x] Received %s', { type, data })
      const maybeTask = this.state.tasks.find(_ => _._id === data._id)

      switch (type) {
        case 'delete': {
          if (maybeTask !== undefined) {
            this.removeTask(data._id)
          } else {
            console.error('socket error remove task')
          }
          break
        }
        case 'insert': {
          if (maybeTask === undefined) {
            this.addTask(data)
          } else {
            console.error('socket error add task')
          }
          break
        }
        case 'update':
        case 'replace': {
          if (maybeTask !== undefined && JSON.stringify(data) !== JSON.stringify(maybeTask)) {
            this.editTask(data)
          } else {
            console.error('socket error edit task')
          }
          break
        }
        default: {
          console.log('unhandled operationType', type, data)
          break
        }
      }
      this.setState({ ticker: data })
    })
  }

  componentWillUnmount() {
    this.socket.close()
  }

  render() {
    let tasks = this.state.tasks.map(item =>
      <Task key={item._id} task={item} onTaskClick={this.onDeleteTask} />
    )

    return (
      <div className="todo-wrapper">
        <form>
          <input type="text" className="input-name" placeholder="Set name" onChange={this.updateName} value={this.state.name} />
          <input type="text" className="input-todo" placeholder="New task" onChange={this.updateText} value={this.state.task} />
          <button className="btn-add" onClick={this.onCreateTask}>+</button>
        </form>
        <ul>
          {tasks}
        </ul>
      </div>
    )
  }

  updateName = (e) => {
    this.setState({ name: e.target.value })
  }

  updateText = (e) => {
    this.setState({ task: e.target.value })
  }

  addTask = (newTask) => {
    console.log('caught new task event: ' + newTask._id)
    this.setState(prevState => ({
      tasks: prevState.tasks.concat(newTask),
      task: '',
      name: ''
    }))
  }

  editTask = (editedTask) => {
    console.log('caught new task event: ' + editedTask._id)
    this.setState(prevState => ({
      tasks: prevState.tasks.map(_ => _._id === editedTask._id ? editedTask : _),
    }))
  }

  removeTask = (id) => {
    console.log('caught remove event: ' + id)
    this.setState(prevState => ({
      tasks: prevState.tasks.filter(el => el._id !== id)
    }))
  }

  syncTasks = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(tasks => this.setState({ tasks }))
      .catch(console.error)
  }

  onCreateTask = (e) => {
    e.preventDefault()
    if (!this.state.task.length) {
      return
    }

    const newTask = {
      task: this.state.task,
      name: this.state.name,
      type: 'task'
    }

    fetch(API_URL + 'new', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    })
      .then((res) => res.json())
      .then((task) => this.addTask(task))
      .catch(console.error)
  }

  onDeleteTask = (id) => {
    fetch(API_URL + id, { method: 'delete' })
      .then((_) => this.removeTask(id))
      .catch(console.error)
  }

}

class Task extends Component {
  onClick = () => {
    this.props.onTaskClick(this.props.task._id)
  }

  render() {
    return (
      <li key={this.props.task._id}>
        <div className="text">@{this.props.task.name}: {this.props.task.task}</div>
        <button className="btn-delete" onClick={this.onClick}>-</button>
      </li>
    )
  }
}

export default App
