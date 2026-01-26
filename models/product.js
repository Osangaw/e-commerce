const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['electronics', 'fashion', 'home', 'beauty', 'sports', 'toys', 'books', 'automotive', 'grocery', 'other'],
      default: 'other'
    },
    quantity: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      trim: true
    },
    images: [
      {
        img: { type: String, required: true },
        public_id: { type: String } // Store this to delete from Cloudinary later
      }
    ]
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;