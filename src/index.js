const express = require("express");
const { createServer } = require("http");
const { port } = require("./config/appConfig");
const cors = require("cors");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/index");
const { ResponseEnhancer } = require("./utils/responseEnhancer");
const { socketHandler } = require("./utils/socket");
require("dotenv").config();

const app = express();

const httpServer = createServer(app);
socketHandler(httpServer);
connectDB();

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(ResponseEnhancer);

app.get("/", (req, res) => {
  res.send("Pizza App running .... ");
});

mainRoutes(app);

app.use((req, res) => {
  return res.error(404, "Route not found");
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
