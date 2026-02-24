require('dotenv').config();

const express = require('express');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 9090;

const app = express();
let server = null

server = http.createServer(app);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');

app.use(express.static('public'));

try {

    server.listen(PORT, () => {
        const protocol = process.env.ENABLE_HTTPS === 'true' ? 'https' : 'http';
        console.log(`Server running on ${protocol}://localhost:${PORT}`);
        console.log('Server is now online');
    });

} catch (err) {
    console.error(`Server Startup Failed:`, err);
    console.error("Startup failed:", err);
    process.exit(1);
}

