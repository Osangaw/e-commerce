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
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);

        // 1. Allow Localhost (Development)
        if (origin === "http://localhost:3000") {
            return callback(null, true);
        }

        // 2. Allow ANY Vercel URL (Production & Previews)
        if (origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }

        // Optional: Allow custom domains if you buy one later
        // if (origin === "https://www.mystore.com") return callback(null, true);

        // Block everything else
        console.log("Blocked by CORS:", origin); 
        return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    credentials: true,
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