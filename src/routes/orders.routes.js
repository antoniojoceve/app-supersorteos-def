const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  createOrder,
  approveOrder,
  rejectOrder
} = require("../controllers/orders.controller");

const { auth, isAdmin } = require("../middlewares/auth.middleware");

router.get("/orders", auth, isAdmin, getAllOrders);
router.post("/orders", auth, createOrder);
router.patch("/orders/:id/approve", auth, isAdmin, approveOrder);
router.patch("/orders/:id/reject", auth, isAdmin, rejectOrder);

module.exports = router;
