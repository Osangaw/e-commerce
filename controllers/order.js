const Order = require("../models/order");

// 1. CREATE NEW ORDER (User)
exports.addOrder = async (req, res) => {
  try {
    // Determine the initial status flow
    // We initialize all steps so the Admin can just toggle "isCompleted" later
    const orderStatus = [
      { type: "ordered", date: new Date(), isCompleted: true },
      { type: "packed", isCompleted: false },
      { type: "shipped", isCompleted: false },
      { type: "delivered", isCompleted: false },
    ];

    const order = new Order({
      ...req.body,
      user: req.user._id, // From middleware
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