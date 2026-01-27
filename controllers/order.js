const Order = require("../models/order");

exports.addOrder = async (req, res) => {
 try {
    // 🔍 DEBUG: Print the user to the console
    console.log("Logged in User from Token:", req.user);

    // 1. Safety Check: Ensure user is logged in
    // Some JWT libraries use 'id', others use '_id'. We check both.
    const userId = req.user ? (req.user._id || req.user.id) : null;

    if (!userId) {
        return res.status(400).json({ error: "User ID missing. Please check your login token." });
    }
    const { 
        totalAmount, 
        items, 
        addressId, 
        paymentType, // Frontend must send "cod" or "card"
        paymentInfo  // Required only if paymentType is "card"
    } = req.body;

    // 1. Define the tracking status (Same for both)
    const orderStatus = [
      { type: "ordered", date: new Date(), isCompleted: true },
      { type: "packed", isCompleted: false },
      { type: "shipped", isCompleted: false },
      { type: "delivered", isCompleted: false },
    ];

    // 2. Default Payment Status
    let paymentStatus = "pending";

    // 3. Handle Logic Based on Payment Type
    if (paymentType === "cod") {
        paymentStatus = "pending"; // COD is always pending initially
    } 
    else if (paymentType === "card") {
        // Validation: Online orders MUST have payment proof
        if (!paymentInfo || !paymentInfo.reference) {
            return res.status(400).json({ message: "Payment reference required for online orders" });
        }
        // If frontend says it's successful, mark as completed
        // (In a real app, you might verify this ref with Paystack/Stripe API here)
        paymentStatus = "completed"; 
    }

    // 4. Create the Order
    const order = new Order({
      user: userId,
      addressId,
      totalAmount,
      items,
      paymentStatus, 
      paymentType,
      paymentInfo, // This will be null/undefined for COD, which is fine
      orderStatus,
    });

    const savedOrder = await order.save();

    res.status(201).json({ 
        message: "Order placed successfully", 
        order: savedOrder 
    });

  } catch (error) {
    console.log("Add Order Error", error);
    res.status(400).json({ error: error.message });
  }
};

// 2. GET MY ORDERS (User)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .select("_id paymentStatus paymentType orderStatus items totalAmount createdAt")
      .populate("items.productId", "name image") // Show product details
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ orders });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 3. GET ALL ORDERS (Admin)
exports.allOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")       
      .populate("items.productId", "name image") 
      .sort({ createdAt: -1 });

    // Calculate total sales for convenience
    const totalSales = orders.reduce((acc, order) => {
        return order.paymentStatus === 'completed' ? acc + order.totalAmount : acc;
    }, 0);

    res.status(200).json({ orders, totalSales });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 4. UPDATE ORDER STATUS (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, type } = req.body;

    // Logic: Find the order by ID AND the specific status type inside the array
    // Then update that specific item's 'isCompleted' and 'date'
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, "orderStatus.type": type },
      {
        $set: {
          "orderStatus.$.isCompleted": true,
          "orderStatus.$.date": new Date(),
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found or Invalid Status type" });
    }

    res.status(200).json({ message: "Status updated", order: updatedOrder });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};