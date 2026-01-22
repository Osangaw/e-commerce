const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // ✅ Good practice: removes extra spaces
    },
    description: {
      type: String,
      trim: true, // ✅ Good practice
    },
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

// ✅ SEARCH RANKING INDEX
// This tells MongoDB: "When searching text, check Name and Description."
// "Name is worth 10 points, Description is worth 5 points."
productSchema.index({ name: 'text', description: 'text' }, { weights: { name: 10, description: 5 } });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;