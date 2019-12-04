const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

// const mongoose = require('mongoose')
// mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// API end points here

// helper functions
const checkIsDate = (date) => date.toUTCString() !== "Invalid Date";
const formatDate = (date) => { // modified from: https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
    let d = date,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

// User (class)
const fs = require('fs');
class User {
  constructor () {
    this.PATH_USERS = 'data/users.json';
    this.PATH_EXERCISES = 'data/exercises.json';
    this.users = this._readFileUsers(); 
    this.exercises = this._readFileExercises();
  }
  _readFileUsers ()     { return (fs.existsSync(this.PATH_USERS))     ? JSON.parse(fs.readFileSync(this.PATH_USERS))     : []; }
  _readFileExercises () { return (fs.existsSync(this.PATH_EXERCISES)) ? JSON.parse(fs.readFileSync(this.PATH_EXERCISES)) : []; }
  getIndex (username) { // username or id
    let ret;
    ret = this.users.findIndex(item => item.username === username);
    if (ret === -1) ret = this.users.findIndex(item => item._id === username);
    return ret;
  } 
  getByIndex (index) { return this.user[index]; }
  addUser (username) {
    let id = this.users.length;
    let newUser = { username: username, _id: id.toString() }
    this.users.push(newUser);
    
    // update file - users
    fs.writeFile(this.PATH_USERS, JSON.stringify(this.users), (err) => {
        if (err) throw err;
        console.log('users.json updated');
    });
    
    return newUser;
  }
  addExercise (id, description, duration, date) {
    let exercise = {_id: id, description: description, duration: duration, date: formatDate(date)}
    this.exercises.push(exercise);
    
    // update file - users
    fs.writeFile(this.PATH_EXERCISES, JSON.stringify(this.exercises), (err) => {
        if (err) throw err;
        console.log('exercises.json updated')
    });    
    
    let index = this.getIndex(id);
    let user = this.users[index];
    return {username: user.username, _id: user._id, description: description, duration: duration, date: formatDate(date)};
  }
  getLog (id, from, to, limit) {
    let index = this.getIndex(id);
    let user = this.users[index];  
    let log = this.exercises.map(item => {if (item._id === id) return item;});

    // check if any filter parameters are set
    if (from && checkIsDate(from)) log = log.filter(item => {if ((new Date(item.date)).getTime() >= from.getTime()) return item});
    if (to && checkIsDate(to)) log = log.filter(item => {    if ((new Date(item.date)).getTime() <= to.getTime()) return item});
    if (limit && !isNaN(limit)) log = log.slice(0, parseInt(limit));
    
    return {_id: user._id, username: user.username, count: log.length, log: log};
  }
}
const user = new User();
console.log(user)

// add user
app.route('/api/exercise/new-user').post((req, res) => {
  let name = req.body.username;
  let index = user.getIndex(name);
  
  if (index !== -1) return res.send('(Error) username already taken');
  res.send(user.addUser(name));
});

// get users
app.route('/api/exercise/users').get((req,res) => {
  res.send(user.users);
});

// add exercise
app.route('/api/exercise/add').post((req,res) => {
  let id = req.body.userId;
  let index = user.getIndex(id);
  if (index === -1) return res.send('(Error) unknown userId');
  
  let info = req.body.description;
  let time = req.body.duration
  let date = new Date(req.body.date);  
  date = (checkIsDate(date)) ? date : new Date(); 
  
  res.send(user.addExercise(id, info, time, date));
})

// get exercise log
app.route('/api/exercise/log').get((req,res) => {
  let id = req.query.userId;
  let index = user.getIndex(id);  
  if (index === -1) return res.send('(Error) unknown userId');
  
  // filter parameters
  let from = new Date(req.query.from),
    to = new Date (req.query.to),
    limit = req.query.limit;
  
  res.send(user.getLog(id, from, to, limit));
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
