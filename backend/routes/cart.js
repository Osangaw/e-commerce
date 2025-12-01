const express = require("express");
const { addToCart, getCart, updateCartItem, removeFromCart, allCarts, deleteCart } = require("../controllers/cart");
const { auth } = require("../middleware");
const router = express.Router();


router.post("/add",auth, addToCart);
router.get("/get", auth, getCart);
router.put("/update", auth, updateCartItem);
router.delete("/remove", auth, removeFromCart);
//router.get("/carts", allCarts);
router.delete("/:id", deleteCart);

module.exports = router;