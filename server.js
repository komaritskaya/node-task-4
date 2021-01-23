const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 8080;

let names = [];

mongoose.connect("mongodb://localhost:27017");
const UserSchema = mongoose.Schema({name: String});
const User = mongoose.model("Users", UserSchema);

const checkMethod = (request, response, next) => {
  if (request.method === 'GET') {
    console.log('Somebody\'s using a wrong method');
  } else if (request.method === 'POST') {
    console.log('Somebody\'s using a right method');
  }
  next();
}

const checkPath = (request, response, next) => {
  if (request.path !== '/names') {
    console.log('Somebody\'s trying to reach a wrong path');
    response.end(`Check your path, kiddo!`);
  } else {
    console.log('Path OK');
    next();
  }
}

const checkSecret = (request, response, next) => {
  if (
    request.headers.iknowyoursecret === 'TheOwlsAreNotWhatTheySeem'
  ) {
    console.log('Access granted');
    console.log('Accessed by url', request.url);
    next();
  } else {
    response.end(`Get the hell outta here`);
  }
}

const checkName = (request, response, next) => {
  let name;
  if (request.headers.name) {
    name = request.headers.name;
  } else {
    name = 'stranger'
  }
  
  const user = new User({name});
  user.save((error, savedUser) => {
    if (error) {
      throw error;
    }
    const {name} = savedUser;
    names.push(name);
    console.log(`${name} entered the room`);
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end(`Hello ${name}!`);
  });
}

app.use(bodyParser.json());
app.use(checkMethod, checkPath, checkSecret);

app.post('/names', checkName);

app.listen(port, (err) => {
  if (err) {
    return console.log('The exception happened: ', err);
  }
  
  console.log(`Server listening on port ${port}`);
  
  User.find({}, (err, users) => {
    console.log("Currently in the room: ", users.map(u => u.name).join(', '));
  })
})