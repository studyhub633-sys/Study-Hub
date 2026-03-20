const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3004,
  path: '/api/admin/creators/invite',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(JSON.stringify({ email: 'test@example.com', commission_rate: 0.2 }));
req.end();
