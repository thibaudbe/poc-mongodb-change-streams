import React, { Component } from 'react'
import './App.css'

const API_URL = 'http://localhost:9000/api/'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      tasks: [],
      task: '',
      name: ''
    }
  }

  updateName = (e) => {
    this.setState({ name: e.target.value })
  }

  updateText = (e) => {
    this.setState({ task: e.target.value })
  }

  postTask = (e) => {
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

  syncTasks = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(tasks => this.setState({ tasks }))
      .catch(console.error)
  }

  deleteTask = (id) => {
    fetch(API_URL + id, { method: 'delete' })
      .then((_) => this.removeTask(id))
      .catch(console.error)
  }

  addTask = (newTask) => {
    console.log('caught new task event: ' + newTask._id)
    this.setState(prevState => ({
      tasks: prevState.tasks.concat(newTask),
      task: ''
    }))
  }

  removeTask = (id) => {
    console.log('caught remove event: ' + id)
    this.setState(prevState => ({
      tasks: prevState.tasks.filter(el => el._id !== id)
    }))
  }

  componentDidMount() {
    this.syncTasks()
  }

  render() {
    let tasks = this.state.tasks.map(item =>
      <Task key={item._id} task={item} onTaskClick={this.deleteTask} />
    )

    return (
      <div className="todo-wrapper">
        <form>
          <input type="text" className="input-name" placeholder="Set name" onChange={this.updateName} value={this.state.name} />
          <input type="text" className="input-todo" placeholder="New task" onChange={this.updateText} value={this.state.task} />
          <button className="btn-add" onClick={this.postTask}>+</button>
        </form>
        <ul>
          {tasks}
        </ul>
      </div>
    )
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
