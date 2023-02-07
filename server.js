const express = require("express");
const path = require("path");
const { wss } = require("./socket_server");

const app = express();
const port = process.env.PORT || 8083;

app.use("/css/", express.static(path.join(__dirname, "public/assets/css")));
app.use("/js", express.static(path.join(__dirname, "public/assets/js")));
app.use("/img", express.static(path.join(__dirname, "public/assets/img")));
app.use("/assets/", express.static(path.join(__dirname, "public/pages/assets")));
app.use("/calibration.html/", express.static(path.join(__dirname, "calibration.html")));
app.use("/main.html/", express.static(path.join(__dirname, "main.html")));
app.use("/books/", express.static(path.join(__dirname, "public/assets/books/")));
app.use("/", express.static(path.join(__dirname, "public/pages/")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/pages/index.html"));
  console.log(__dirname);
});



const server = app.listen(port, "0.0.0.0");
// const server = app.listen(port);

console.log("Server started at http://localhost:" + port);


server.on("upgrade", (request, socket, head) => {
  console.log("upgrading .. ");
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});