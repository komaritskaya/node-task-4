const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const dbName = "names.json";

const app = express();
const port = 8080;

let names = [];

if (fs.existsSync(dbName)) {
  names = JSON.parse(fs.readFileSync(dbName, "utf8"));
  console.log('names read from file >>>>', names);
}

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
  names.push(name);
  console.log(`${name} entered the room`);
  response.writeHead(200, { "Content-Type": "text/plain" });
  fs.writeFile(dbName, JSON.stringify(names), (err) => {
    if (err) {
      throw err;
    }
  });
  response.end(`Hello ${names.join(', ')}!`);
}

app.use(bodyParser.json());
app.use(checkMethod, checkPath, checkSecret);

app.post('/names', checkName);

app.listen(port, (err) => {
  if (err) {
    return console.log('The exception happened: ', err);
  }
  
  console.log(`Server listening on port ${port}`);
})