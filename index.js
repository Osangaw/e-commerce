const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./DB/dataBase');

// Import Routes
const authRoute = require('./routes/user');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const shippingRoute = require("./routes/address");

dotenv.config();
const app = express();


app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://react-ecommerce-rouge-three.vercel.app", 
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], // Removed invalid 'UPDATE'
    credentials: true, // Important if you use cookies or Authorization headers
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/", authRoute);
app.use("/product", productRoute);
app.use("/cart", cartRoute);
app.use("/address", shippingRoute);

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});