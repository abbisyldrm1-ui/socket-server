const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("AURA SERVER LIVE");
});

let waitingUser = null;

io.on("connection", (socket) => {

  console.log("USER CONNECTED:", socket.id);

  // FIND MATCH
  socket.on("find", () => {

    console.log("FIND:", socket.id);

    // KENDİNİ TEMİZLE
    socket.partner = null;

    // EŞLEŞTİR
    if (waitingUser && waitingUser.id !== socket.id) {

      const partner = waitingUser;

      waitingUser = null;

      socket.partner = partner.id;
      partner.partner = socket.id;

      console.log("MATCHED:", socket.id, partner.id);

      // İLK KİŞİ
      socket.emit("matched", {
        partnerId: partner.id,
        initiator: true,
      });

      // İKİNCİ KİŞİ
      partner.emit("matched", {
        partnerId: socket.id,
        initiator: false,
      });

    } else {

      // BEKLEME
      waitingUser = socket;

      console.log("WAITING:", socket.id);

      socket.emit("waiting");

    }

  });

  // WEBRTC SIGNAL
  socket.on("signal", ({ to, data }) => {

    console.log("SIGNAL:", socket.id, "→", to);

    io.to(to).emit("signal", {
      from: socket.id,
      data,
    });

  });

  // NEXT
  socket.on("next", () => {

    console.log("NEXT:", socket.id);

    // ESKİ PARTNERİ AYIR
    if (socket.partner) {

      io.to(socket.partner).emit("partner-left");

    }

    socket.partner = null;

    // YENİDEN BEKLE
    waitingUser = socket;

    socket.emit("waiting");

  });

  // DISCONNECT
  socket.on("disconnect", () => {

    console.log("DISCONNECT:", socket.id);

    // WAITING İSE TEMİZLE
    if (waitingUser && waitingUser.id === socket.id) {

      waitingUser = null;

    }

    // PARTNER VARSA AYIR
    if (socket.partner) {

      io.to(socket.partner).emit("partner-left");

    }

  });

});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {

  console.log("SERVER RUNNING:", PORT);

});