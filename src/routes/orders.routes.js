const express = require("express");
const router = express.Router();
const { getAllOrders } = require("../controllers/orders.controller");
const { auth, isAdmin } = require("../middlewares/auth.middleware");

router.get("/orders", auth, isAdmin, getAllOrders);

module.exports = router;
