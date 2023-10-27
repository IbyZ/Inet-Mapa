const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

// Inicializaciones
const app = express();
const server = http.createServer(app);
const io = socketIO(server)

//Configuraciones
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use(require('./routes/'));

// Sockets
require('./sockets')(io);

// Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')))

// Iniciando el Server
server.listen (3000, () => {
    console.log('Server on port 3000')
});