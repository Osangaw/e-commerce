const Cart = require("../models/cart");

const Product = require("../models/product");


exports.addToCart = async (req, res) => {
  try {
    // 1. Get User ID (Safety check for 'id' vs '_id')
    const userId = req.user.id || req.user._id;

    // 2. Prepare the list of items to process
    // We check if the request is a "Bulk Sync" (array) or "Single Add" (object)
    let itemsProcess = [];

    if (req.body.cartItems) {
      // Scenario A: Guest Cart Sync (Array of items)
      itemsProcess = req.body.cartItems;
    } else if (req.body.productId && req.body.quantity) {
      // Scenario B: User clicked "Add to Cart" (Single item)
      itemsProcess = [{ 
          product: req.body.productId, 
          quantity: req.body.quantity 
      }];
    } else {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // 3. Find User's Cart
    // Note: We use 'user' because your schema likely defines it as 'user', not 'userId'
    let cart = await Cart.findOne({ userId });

    // 4. Create Cart if it doesn't exist
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    // 5. Loop through items and update logic
    for (const item of itemsProcess) {
        // Handle different payload structures (some send 'product', some 'productId')
        const targetProductId = item.product || item.productId;
        const targetQty = Number(item.quantity);

        // Check if product exists in DB (optional safety)
        const productExists = await Product.findById(targetProductId);
        if (!productExists) continue; 

        // Check if item is already in the cart
        const existingItem = cart.items.find(
            (cItem) => cItem.productId.toString() === targetProductId.toString()
        );

        if (existingItem) {
            // Update quantity
            existingItem.quantity += targetQty;
        } else {
            // Push new item
            cart.items.push({ 
                productId: targetProductId, 
                quantity: targetQty 
            });
        }
    }

    // 6. Save and Return
    await cart.save();
  
    const populatedCart = await Cart.findById(cart._id)
        .populate("items.productId", "name price image");

    return res.status(200).json({ 
        message: "Cart updated successfully", 
        cart: populatedCart 
    });
    
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
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