const Cart = require("../models/cart");
const Order = require("../models/order");

exports.addOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!userId) {
        return res.status(400).json({ error: "User ID not found in token." });
    }

    const { 
        totalAmount, 
        items, 
        addressId, 
        paymentType, 
        paymentInfo 
    } = req.body;

    // 2. Define Status
    const orderStatus = [
      { type: "ordered", date: new Date(), isCompleted: true },
      { type: "packed", isCompleted: false },
      { type: "shipped", isCompleted: false },
      { type: "delivered", isCompleted: false },
    ];

    // 3. Define Payment Status
    let paymentStatus = "pending";
    if (paymentType === "cod") {
        paymentStatus = "pending";
    } else if (paymentType === "card") {
        if (!paymentInfo || !paymentInfo.reference) {
            return res.status(400).json({ message: "Payment reference required for online orders" });
        }
        paymentStatus = "completed"; 
    }

    // 4. Create Order
    const order = new Order({
      user: userId,
      addressId,
      totalAmount,
      items,
      paymentStatus, 
      paymentType,
      paymentInfo,
      orderStatus,
    });

    const savedOrder = await order.save();
    const deleteCart = await Cart.deleteOne({ userId });
   // console.log("Cart cleared after order:", deleteCart);

    
    res.status(201).json({ 
        message: "Order placed successfully", 
        order: savedOrder 
    });

  } catch (error) {
    console.log("Add Order Error", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const orders = await Order.find({ user: userId })
      .select("_id paymentStatus paymentType orderStatus items totalAmount createdAt addressId")
      .populate("items.productId", "name image")
      //.populate("addressId")
      .sort({ createdAt: -1 }); 
      
    console.log("User Orders:", orders);
    res.status(200).json({ orders });
  } catch (error) {
    console.log("Get Orders Error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.allOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")       
      .populate("items.productId", "name image") 
      //.populate("addressId")
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

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }


    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

   
    const isShipped = order.orderStatus.find(
      (status) => (status.type === "shipped" || status.type === "delivered") && status.isCompleted === true
    );

    if (isShipped) {
      return res.status(400).json({ error: "Cannot cancel order. It has already been shipped or delivered." });
    }

    order.paymentStatus = "cancelled";
    
    // We keep the original 'ordered' date, but set the rest to 'cancelled'
    order.orderStatus = [
        { type: "ordered", isCompleted: true, date: order.createdAt },
        { type: "cancelled", isCompleted: true, date: new Date() }
    ];

    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.log("Cancel Order Error:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await Order.findById(orderId)
      .populate("items.productId", "name image")
      .populate("addressId")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.log("Get Order Details Error:", error);
    res.status(400).json({ error: error.message });
  }
};