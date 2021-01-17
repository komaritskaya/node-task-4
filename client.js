const http = require('http')

const postOptions = {
  hostname: 'localhost',
  port: 8080,
  path: '/names',
  method: 'POST',
  headers: {
    'iknowyoursecret': 'TheOwlsAreNotWhatTheySeem',
    'name': process.argv[2] || 'stranger'
  }
}

const postRequest = http.request(postOptions, res => {
  res.on('data', d => {
    process.stdout.write(d);
  })
})

postRequest.on('error', error => {
  console.error(error);
})

postRequest.end();