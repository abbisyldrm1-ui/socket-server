const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Aura socket server aktif");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let waitingUser = null;

const peerMap = {};

io.on("connection", (socket) => {

  console.log("Bağlandı:", socket.id);

  socket.on("peer-id", (peerId) => {

    peerMap[socket.id] = peerId;

  });

  socket.on("find-match", () => {

    if (
      waitingUser &&
      waitingUser !== socket.id
    ) {

      const otherUser = waitingUser;

      const otherPeer =
        peerMap[otherUser];

      const currentPeer =
        peerMap[socket.id];

      io.to(otherUser).emit(
        "matched",
        {
          peerId: currentPeer,
        }
      );

      io.to(socket.id).emit(
        "matched",
        {
          peerId: otherPeer,
        }
      );

      waitingUser = null;

    } else {

      waitingUser = socket.id;

      socket.emit("waiting");

    }

  });

  socket.on("next", () => {

    waitingUser = socket.id;

    socket.emit("waiting");

  });

  socket.on("disconnect", () => {

    delete peerMap[socket.id];

    if (waitingUser === socket.id) {
      waitingUser = null;
    }

  });

});

const PORT =
  process.env.PORT || 3001;

server.listen(PORT, () => {

  console.log(
    "Socket server çalışıyor:",
    PORT
  );

});