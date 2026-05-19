const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("AURA SOCKET SERVER AKTIF - FINAL");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

let waiting = null;

io.on("connection", (socket) => {
  console.log("BAGLANDI:", socket.id);

  socket.emit("server-ready", socket.id);

  socket.on("find-match", () => {
    console.log("MATCH ISTEDI:", socket.id);

    if (waiting && waiting !== socket.id) {
      const partner = waiting;
      waiting = null;

      console.log("ESLESTI:", socket.id, partner);

      socket.emit("matched", { partnerId: partner });
      io.to(partner).emit("matched", { partnerId: socket.id });
    } else {
      waiting = socket.id;
      console.log("BEKLIYOR:", socket.id);
      socket.emit("waiting");
    }
  });

  socket.on("disconnect", () => {
    console.log("CIKTI:", socket.id);
    if (waiting === socket.id) waiting = null;
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("SERVER AKTIF:", PORT);
});