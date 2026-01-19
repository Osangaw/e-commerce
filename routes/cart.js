const express = require("express");
const { addToCart, getCart, updateCartItem, removeFromCart, allCarts, deleteCart, incrementQuantity, decrementQuantity } = require("../controllers/cart");
const { auth } = require("../middleware");
const router = express.Router();


router.post("/add",auth, addToCart);
router.get("/get", auth, getCart);
router.put("/update", auth, updateCartItem);
router.delete("/remove", auth, removeFromCart);
//router.get("/carts", allCarts);
router.delete("/:id", deleteCart);
router.patch("/inc", auth, incrementQuantity);
router.patch("/dec", auth, decrementQuantity);

module.exports = router;