const cloudinary = require("cloudinary");
const fs = require("fs");

const API_KEY = "176928677163175"
const API_SECRET= "EZLhwIM6Y8K9DtAOQJS8dysDmRQ"
const CLOUD_NAME = "dsm2zoosd"
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});


const uploadFile = async (filePath, folder = "Js-bookstore") => {
  try {
    const upload = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      quality: "auto:good",
      fetch_format: "auto",
      transformation: [{ width: 800, height: 800, crop: "limit" }], // 'limit' is usually lowercase
    });

    // Delete file from server after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Return the specific keys our Controller needs
    return { uri: upload.secure_url, public_id: upload.public_id };

  } catch (err) {
    console.log("Cloudinary Upload Error:", err);
    // Delete file even if upload fails so tmp folder doesn't fill up
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return undefined; 
  }
};

module.exports = { uploadFile };