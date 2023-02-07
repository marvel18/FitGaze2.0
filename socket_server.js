
const WebSocket = require("ws");

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (data) => {
    console.log("Client has sent us : " + data);
  });
  ws.on("close", () => {
    console.log("Client has disconnected");
  });
});



module.exports = { wss };