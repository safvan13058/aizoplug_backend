const express = require('express');
const app = express();
const db = require('./middelware/db')


const cors = require('cors');

// Allow all origins (or customize for specific origins)
app.use(cors());





const appbackend = require('./app/app')
app.use('/app', appbackend)

const dashboard = require('./dashboard/dashboard')
app.use('/dashboard', dashboard)

const usermanage = require('./app/usermange')
app.use('/user',usermanage)

const payment = require('./payment/payment.js')
app.use('/payment',payment)


const charging = require('./app/charging')
app.use('/charging',charging)

const { swaggerUi, specs } = require("./swaggerdoc/swagger.js");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/test", (req, res) => {
    res.send("Server is running aizoplug");
  });
  
const fs = require('fs');
const http = require('http');
const https = require('https');
const PORT_HTTPS = 3000; // HTTPS port
const PORT_HTTP = 3001;  // HTTP port

let isHttpsAvailable = false;

try {
    // Try loading SSL certificates
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/host.aizoplug.com/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/host.aizoplug.com/fullchain.pem'),
    };

    // If SSL certificates are available, start the HTTPS server
    https.createServer(options, app).listen(PORT_HTTPS, () => {
        isHttpsAvailable = true;
        console.log(`HTTPS Server is running on https://13.200.215.17:${PORT_HTTPS}`);
    });


     // Start HTTPS on port 443
  https.createServer(options, app).listen(443, () => {
    console.log('✅ HTTPS server is running on https://host.aizoplug.com (port 443)');
  });
  
} catch (error) {
    console.error('HTTPS setup failed:', error.message);
    console.log('HTTPS is unavailable, starting HTTP...');
}

// If HTTPS is not available, fallback to HTTP
if (!isHttpsAvailable) {
    // Start HTTP server
    http.createServer(app).listen(PORT_HTTP, () => {
        console.log(`HTTP Server is running on http://13.200.215.17:${PORT_HTTP}`);
    });
} else {
    // If HTTPS is available, redirect HTTP traffic to HTTPS
    http.createServer((req, res) => {
        res.writeHead(301, `{ Location: https://${req.headers.host}${req.url} }`);
        res.end();
    }).listen(PORT_HTTP, () => {
        console.log(`HTTP Server is redirecting traffic to HTTPS on http://13.200.215.17:${PORT_HTTP}`);
    });
}


// app.listen(PORT,
//     '0.0.0.0',
//      () => {
//     console.log(Server running on port ${PORT});
// });

