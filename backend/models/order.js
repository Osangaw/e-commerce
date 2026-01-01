const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAddress.address", // Linking to the specific address sub-document
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      payablePrice: { type: Number, required: true },
      purchasedQty: { type: Number, required: true },
    },
  ],
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "cancelled", "refunded"],
    required: true,
  },
  paymentType: {
    type: String,
    enum: ["cod", "card"], // Cash on Delivery or Card (Paystack)
    required: true,
  },
  // Store the Paystack Reference so you can track it later
  paymentInfo: {
    reference: { type: String }, 
    status: { type: String }
  },
  orderStatus: [
    {
      type: { type: String, enum: ["ordered", "packed", "shipped", "delivered"], default: "ordered" },
      date: { type: Date },
      isCompleted: { type: Boolean, default: false },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);