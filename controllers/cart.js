const Cart = require("../models/cart");

const Product = require("../models/product");


exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Product ID and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity; 
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
  
    const populatedCart = await Cart.findById(cart._id)
        .populate("items.productId", "name price image");

    return res.status(200).json({ message: "Item added to cart", cart: populatedCart });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id; 
    const cart = await Cart.findOne({ userId })
      .populate("items.productId", "name price image");

    if (!cart) {
      console.log("No cart found for this user, returning empty list.");
      return res.status(200).json({ cart: { items: [] } }); 
    }

    console.log("Cart found:", cart);
    return res.status(200).json({ message: "Cart found", cart });

  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  console.log("1. ID from Frontend:", productId);
    console.log("2. IDs inside Cart:", cart.items.map(i => i.productId.toString()));

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    return res.status(200).json({ message: "Cart updated", cart });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { productId } = req.body; 

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
        .populate("items.productId", "name price image");

    return res.status(200).json({ message: "Item removed from cart", cart: populatedCart });
    
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.allCarts = async (req, res) => {
  try {
    const carts = await Cart.find({});
    if (!carts.length) {
      console.log("No Carts in the Database");
      return res.status(404).json({ message: "No Carts in Database" });
    }
    console.log("all carts:", carts);
    return res.status(200).json(carts);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleteCart = await Cart.findByIdAndDelete( id );
    if (!deleteCart) {
      console.log(`Cart with id: ${id} not found`);
      res.status(404).json({ message: "Cart not found" });
    }
    console.log("Cart Deleted Successully", deleteCart);
    return res.status(200).json({ mesage: "Cart deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.incrementQuantity = async (req, res) => {
  try {
    console.log('test');
    
    const { productId } = req.body;
    const userId = req.user._id ? req.user._id.toString() : req.user.id;

    const cart = await Cart.findOne({ $or: [{ user: userId }, { userId: userId }] });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => 
      (i.productId && i.productId._id ? i.productId._id.toString() : i.productId.toString()) === productId || 
      (i._id && i._id.toString() === productId)
    );
        console.log("item:",item);


    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = item.quantity + 1;
    
    await cart.save();
    return res.status(200).json({ message: "Quantity increased", cart });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.decrementQuantity = async (req, res) => {
  try {
    console.log('test');
    
    const { productId } = req.body;
    const userId = req.user._id ? req.user._id.toString() : req.user.id;

    const cart = await Cart.findOne({ $or: [{ user: userId }, { userId: userId }] });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => 
      (i.productId && i.productId._id ? i.productId._id.toString() : i.productId.toString()) === productId || 
      (i._id && i._id.toString() === productId)
    );
        console.log("item:",item);


    if (!item) return res.status(404).json({ message: "Item not found" });

 if (item.quantity > 1) {
        item.quantity = item.quantity - 1;
    } else {
        // If it is 1, do nothing. It stays 1.
        console.log("Quantity is already 1. Skipping update.");
    }

    await cart.save();
    return res.status(200).json({ message: "Quantity decreased", cart });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};