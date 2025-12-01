const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require("body-parser");
const connectDB = require('./DB/dataBase');
const authRoute = require('./routes/user');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');

dotenv.config()
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.use(express.json());
const PORT = 3030;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
    connectDB();
});

app.use("/", authRoute)
app.use("/product", productRoute)
app.use("/cart", cartRoute)