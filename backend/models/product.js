const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,

    price: {
      type: Number,
      required: true,
    },
    category: {
     type: String,
    enum: [
      'electronics',
      'fashion',
      'home',
      'beauty',
      'sports',
      'toys',
      'books',
      'automotive',
      'grocery',
      'other'
    ],
    default: 'other'
    },
    quantity: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
     // required: true,
    }
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
