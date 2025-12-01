const { mongoose } = require("mongoose");

const connectDB = async () => {
  const MONGO_URL = process.env.MONGO_URL;
  try {await    
    mongoose
      .connect(MONGO_URL)
            .then(() => console.log("MongoDB connected successfully"))
      .catch((err) => console.log(err, "error connecting to MongoDB"));
  } catch (e) {
    console.log("Error connecting to Db", e);
  }
};

module.exports = connectDB;
