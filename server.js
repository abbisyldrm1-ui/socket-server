const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
  },
})

let waitingUser = null

io.on("connection", (socket) => {

  console.log("Yeni kullanıcı")

  socket.on("find-partner", (peerId) => {

    socket.peerId = peerId

    if (waitingUser && waitingUser !== socket) {

      io.to(socket.id).emit("matched", waitingUser.peerId)

      io.to(waitingUser.id).emit("matched", socket.peerId)

      waitingUser = null

    } else {

      waitingUser = socket

      socket.emit("waiting")

    }

  })

  socket.on("disconnect", () => {

    if (waitingUser?.id === socket.id) {
      waitingUser = null
    }

  })

})

server.listen(process.env.PORT || 3000, () => {
  console.log("Socket server aktif")
})