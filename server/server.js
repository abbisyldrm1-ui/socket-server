const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("AURA SOCKET SERVER AKTIF");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let waitingUser = null;

io.on("connection", (socket) => {

  console.log("KULLANICI BAGLANDI:", socket.id);

  socket.on("find-match", () => {

    console.log("MATCH ISTIYOR:", socket.id);

    // kendisi zaten waiting ise
    if (waitingUser && waitingUser.id === socket.id) {
      return;
    }

    // waiting user varsa eşleştir
    if (waitingUser) {

      const partner = waitingUser;

      waitingUser = null;

      const roomId = `room-${socket.id}-${partner.id}`;

      socket.join(roomId);
      partner.join(roomId);

      socket.emit("matched", {
        roomId,
        partnerId: partner.id,
      });

      partner.emit("matched", {
        roomId,
        partnerId: socket.id,
      });

      console.log("ESLESTI:", roomId);

    } else {

      waitingUser = socket;

      socket.emit("waiting");

      console.log("BEKLIYOR:", socket.id);

    }

  });

  // WebRTC signal
  socket.on("signal", ({ to, data }) => {

    io.to(to).emit("signal", {
      from: socket.id,
      data,
    });

  });

  // sonraki kullanıcı
  socket.on("next", () => {

    console.log("SONRAKI:", socket.id);

    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

    socket.emit("waiting");

    waitingUser = socket;

  });

  // bağlantı çıkışı
  socket.on("disconnect", () => {

    console.log("CIKTI:", socket.id);

    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

  });

});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("SERVER AKTIF:", PORT);
});