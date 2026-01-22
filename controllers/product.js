const Product = require("../models/product");
const { uploadFile } = require("../util/cloudinary");


exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;
    console.log("req.body:", req.body);

    if (!name || !price || !description || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const imageFile = req.file;
    let imageUrl = "";
    if (imageFile) {
      const uploadResult = await uploadFile(imageFile.path);

      if (uploadResult && uploadResult.uri) {
        imageUrl = uploadResult.uri;
        console.log("Image uploaded successfully:", imageUrl);
      }
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      quantity,
      image: imageUrl,
    });
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created successfully", newProduct });
    console.log("Product created:", newProduct);
  } catch (e) {
    console.log("Error while creating product", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.allProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (e) {
    console.log("Error fetching products:", e);
    return res.status(500).json({ message: "Error in getting all products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('p', req.params.id);
    
    const product = await Product.findById( id );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product found", product });
    console.log(`Product with id: ${id} found`, product);
  } catch (e) {
    return res.status(500).json({ message: "error in getting product by id" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(` Product updated: ${id}`, updatedProduct);
    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (e) {
    console.error(" Error updating product:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await Product.findByIdAndDelete(id);
    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(`Product deleted: ${id}`, deleteProduct);
    res
      .status(200)
      .json({ message: "Product deleted successfully", deleteProduct });
  } catch (e) {
    console.error("Error deleting product:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAllProducts = async (req, res) => {
  try {
    await Product.deleteMany({}); 

    res.status(200).json({
      message: "All products have been deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting products",
      error: error.message,
    });
  }
};

exports.searchProduct = async (req, res) => {
  try {
    const { key } = req.params;
    
    // 1. Search using Regex (Finds partial matches like "s" or "iph")
    const results = await Product.find({
      $or: [
        { name: { $regex: key, $options: "i" } },
        { description: { $regex: key, $options: "i" } },
        { category: { $regex: key, $options: "i" } }
      ]
    });

    // 2. Sort Results: Put items STARTING with the key at the top
    results.sort((a, b) => {
        const lowerKey = key.toLowerCase();
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        const startsA = nameA.startsWith(lowerKey);
        const startsB = nameB.startsWith(lowerKey);

        if (startsA && !startsB) return -1; // A comes first
        if (!startsA && startsB) return 1;  // B comes first
        return 0;
    });

    console.log(`Search results for ${key}:`, results.length);
    return res.status(200).json(results);

  } catch (error) {
    console.log("Search Error:", error);
    return res.status(500).json({ message: "Search failed" });
  }
};