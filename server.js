const http = require('http');
const fs = require('fs');
const dbName = "names.json";

let names = [];
if (fs.existsSync(dbName)) {
  names = JSON.parse(fs.readFileSync(dbName, "utf8"));
  console.log('names read from file >>>>', names);
}

const port = 8080;
const requestHandler = (request, response) => {
  if (
    request.method === 'POST' &&
    request.headers.iknowyoursecret === 'TheOwlsAreNotWhatTheySeem'
  ) {
    console.log('Accessed by url', request.url);
    response.writeHead(200, { "Content-Type": "text/plain" });
    let name;
    if (request.headers.name) {
      name = request.headers.name;
    } else {
      name = 'stranger'
    }
    names.push(name);
    fs.writeFile(dbName, JSON.stringify(names), (err) => {
      if (err) {
        throw err;
      }
    });
    response.end(`Hello ${names.join(', ')}!`);
  } else {
    response.end(`Get the hell outta here`);
  }
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('The exception happened: ', err);
  }
  
  console.log(`Server listening on port ${port}`);
})