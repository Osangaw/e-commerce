const express = require("express");
const { addOrder, getOrders, allOrders, updateOrderStatus } = require("../controllers/order");
const { auth, isAdmin } = require("../middleware");
const router = express.Router();

router.post("/add", auth, addOrder);
router.get("/get", auth, getOrders);
router.get("/all", auth, isAdmin, allOrders);
router.patch("/updateStatus/:id", auth, isAdmin, updateOrderStatus);

module.exports = router;