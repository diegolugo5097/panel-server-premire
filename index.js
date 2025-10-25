const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Estado global en memoria
// currentHero es el héroe actualmente seleccionado por el control
// infoVisible = si el panel flotante (historia + panel médico) está visible en la pantalla
let currentHero = null;
// {
//   imageUrl,
//   name,
//   firstAppearanceYear,
//   currentAge,
//   story,
//   medical: { status, heartRate, radiationLevel, threatLevel, notes }
// }

let infoVisible = false;

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Cuando un cliente nuevo (por ejemplo el DisplayApp) se conecta,
  // le mandamos el estado actual para que se sincronice al instante.
  if (currentHero) {
    socket.emit('set_hero', { hero: currentHero });
  }

  if (infoVisible) {
    socket.emit('show_info');
  } else {
    socket.emit('hide_info');
  }

  // El control selecciona un héroe
  socket.on('set_hero', ({ hero }) => {
    currentHero = hero;
    io.emit('set_hero', { hero });
  });

  // El control pide mostrar la información extendida en el display
  socket.on('show_info', () => {
    infoVisible = true;
    io.emit('show_info');
  });

  // El control pide ocultar la información extendida
  socket.on('hide_info', () => {
    infoVisible = false;
    io.emit('hide_info');
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket server escuchando en http://localhost:${PORT}`);
});
