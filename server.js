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

  console.log("Yeni kullanıcı:", socket.id)

  socket.on("find-partner", () => {

    if (waitingUser && waitingUser !== socket) {

      socket.partner = waitingUser.id
      waitingUser.partner = socket.id

      io.to(socket.id).emit("matched", waitingUser.id)
      io.to(waitingUser.id).emit("matched", socket.id)

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