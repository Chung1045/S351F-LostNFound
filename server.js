require('dotenv').config();

const express = require('express');
const http = require('http');
const https = require('https');
const helmet = require('helmet');
const cors = require('cors');
const socketIo = require('socket.io');

const db = require('./public/db/database.cjs');

const PORT = process.env.PORT || 9090;

const app = express();
let server = null

server = http.createServer(app);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');

app.use(express.static('public'));
app.use(helmet());
app.use(cors());
app.use(express.json());


async function setupRoutes() {
    const pageRouteManager = require('./public/server/route-manager/pageRouteManager');
    const credentialManager = require('./public/server/route-manager/credentialManager');
    const authRouteManager = require('./public/server/route-manager/authRouteManager');
    const postRouteManager = require('./public/server/route-manager/postRouteManager');
    const commentRouteManager = require('./public/server/route-manager/commentRouteManager');
    const notificationRoutes = require('./public/server/route-manager/notificationRouteManager');
app.use('/api', notificationRoutes);
    /** You are gonna have more than one API route manager here, define them here */

    app.use("/", pageRouteManager);

    /** With this, all routes defined in credentialManager.js will have a suffix "/api/" before the route */
    app.use("/api/", credentialManager);

    /** app.use("/api/", postRouteManager); */
    app.use("/api/", authRouteManager);

    app.use("/api/", postRouteManager);

    app.use("/api/", commentRouteManager); 
}


(async () => {
    try {
        await setupRoutes();
        server.listen(PORT, () => {
            const protocol = process.env.ENABLE_HTTPS === 'true' ? 'https' : 'http';
            console.log(`Server running on ${protocol}://localhost:${PORT}`);
            console.log('Server is now online');
        });
    } catch (err) {
        console.error('Server Startup Failed:', err);
        process.exit(1);
    }
})();

