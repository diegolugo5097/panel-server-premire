import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

// Lista blanca de orígenes permitidos (agrega aquí tus URLs reales de Netlify)
const allowedOrigins = [
  "http://localhost:3000",             // Control local dev
  "http://localhost:3001",             // Display local dev
  "https://display-premiere.netlify.app",   // Control en Netlify
  "https://fanciful-stroopwafel-edf983.netlify.app"    // Display en Netlify
  // si usas un solo dominio netlify, igual déjalo aquí
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  })
);

app.get("/", (req, res) => {
  res.send("🟢 Socket server OK");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  }
});

// ====== Estado compartido ======
let currentHero = null;
// { imageUrl, name, firstAppearanceYear, currentAge, story, medical: {...} }

let infoVisible = false;

// ====== Eventos Socket.IO ======
io.on("connection", (socket) => {
  console.log("🛰️ Cliente conectado:", socket.id);

  // sincroniza al recién conectado con el héroe actual
  if (currentHero) {
    socket.emit("set_hero", { hero: currentHero });
  }

  // sincroniza el estado del panel flotante
  socket.emit(infoVisible ? "show_info" : "hide_info");

  // viene del ControlApp cuando se selecciona un héroe
  socket.on("set_hero", ({ hero }) => {
    currentHero = hero;
    console.log("🦸 Héroe activo:", hero.name);
    io.emit("set_hero", { hero });
  });

  // viene del ControlApp al presionar "MOSTRAR INFORMACIÓN"
  socket.on("show_info", () => {
    infoVisible = true;
    io.emit("show_info");
  });

  // viene del ControlApp al presionar "OCULTAR INFORMACIÓN"
  socket.on("hide_info", () => {
    infoVisible = false;
    io.emit("hide_info");
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

// Render te da PORT automáticamente en una env var
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server escuchando en puerto ${PORT}`);
});
