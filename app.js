require("dotenv").config();
require("express-async-errors");

const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Routers
const apiRoute = require("./routes/api");
const nftsRoute = require("./routes/nfts");
const authRoute = require("./routes/auth");

// Routes

app.use("/", authRoute);
app.use("/api", apiRoute);
app.use("/nfts", authenticateUser, nftsRoute);

app.use(express.static(path.join(__dirname, "client", "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`Server is listening PORT ${PORT}...`));
  } catch (error) {}
};

start();
