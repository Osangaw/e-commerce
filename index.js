const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// const bodyParser = require("body-parser"); // Not needed, express.json() is enough
const connectDB = require('./DB/dataBase');

// Import Routes
const authRoute = require('./routes/user');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const shippingRoute = require("./routes/address");

dotenv.config();
const app = express();

// ✅ FIX: Explicit CORS Config to allow PATCH and Authorization headers
app.use(cors({
    origin: '*', // Allow all origins (Change to 'http://localhost:3000' for production)
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));



app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use("/", authRoute);
app.use("/product", productRoute);
app.use("/cart", cartRoute);
app.use("/address", shippingRoute);

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});