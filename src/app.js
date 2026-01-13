const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const usersRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");
const rafflesRoutes = require("./routes/raffles.routes");
const ordersRoutes = require("./routes/orders.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", usersRoutes);
app.use("/api", authRoutes);
app.use("/api/raffles", rafflesRoutes);
app.use("/api", ordersRoutes);

module.exports = app;
