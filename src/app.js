const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { expirePendingOrders } = require("./services/expireOrders");

const healthRoutes = require("./routes/health.routes");
const usersRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");
const rafflesRoutes = require("./routes/raffles.routes");
const ordersRoutes = require("./routes/orders.routes");
const { logInfo, logError } = require("./logger");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", usersRoutes);
app.use("/api", authRoutes);
app.use("/api/raffles", rafflesRoutes);
app.use("/api", ordersRoutes);


// Expirar órdenes pending cada 5 minutos
cron.schedule("*/5 * * * *", async () => {
  try {
    const count = await expirePendingOrders();
    if (count > 0) {
      logInfo(`${count} órdenes expiradas automáticamente`);
    }
  } catch (err) {
    logError(err);
  }
});
    
module.exports = app;