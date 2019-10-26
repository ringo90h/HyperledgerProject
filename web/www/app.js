'use strict';

const Server = require('http').Server;
const express = require('express');
const socketIo = require('socket.io');


const configureExpress = require('./config/express');
const shopRouter = require('./routers/shop.router');
const SHOP_ROOT_URL = '/shop';

const app = express();
const httpServer = new Server(app);

// Setup web sockets
const io = socketIo(httpServer);
shopRouter.wsConfig(io.of(SHOP_ROOT_URL));

configureExpress(app);

app.get('/', (req, res) => {
    res.render('home', { homeActive: true });
});

// Setup routing
app.use(SHOP_ROOT_URL, shopRouter.router);

module.exports = httpServer;