const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

// For testing purposes, generate a self-signed certificate
const credentials = {
  key: fs.readFileSync("server-key.pem"),
  cert: fs.readFileSync("server-cert.pem"),
};

const httpsServer = https.createServer(credentials, app);

const io = new Server(httpsServer, {
  cors: {
    origin: "https://client-chatapp.vercel.app/",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Choose the appropriate port for HTTP and HTTPS
const httpPort = process.env.HTTP_PORT || 3000;
const httpsPort = process.env.HTTPS_PORT || 3001;

httpServer.listen(httpPort, () => {
  console.log(`HTTP Server running on http://localhost:${httpPort}`);
});

httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS Server running on https://localhost:${httpsPort}`);
});
