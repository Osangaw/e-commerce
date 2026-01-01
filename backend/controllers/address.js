const ShippingAddress = require("../models/address");

exports.addAddress = async (req, res) => {
  const { name, phoneNumber, address, city, postalCode, country } = req.body;
  console.log(req.body);
  
  try {
    const userId = req.user.id || req.user._id;


    const addressCount = await ShippingAddress.countDocuments({ userId });

    if (addressCount >= 2) {
      return res.status(400).json({ 
        message: "You can only save up to 2 addresses. Please delete one to add another." 
      });
    }

    const newAddress = new ShippingAddress({
      userId,
      name,
      phoneNumber,
      address,
      city,
      postalCode,
      country,
    });
    
    await newAddress.save();
    console.log("address added to db", newAddress);

    return res.status(200).json({
      message: "Shipping Address added successfully",
      address: newAddress,
    });

  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};
exports.getAddresses = async (req, res) => {
  try {
   
    const userId = req.user.id || req.user._id;

    if (!userId) {
      console.log("DEBUG - No User ID found in request!");
      return res.status(400).json({ error: "User ID missing" });
    }

    const addresses = await ShippingAddress.find({ userId });
    return res.status(200).json({ addresses });

  } catch (e) {
    console.log("DEBUG - Error:", e.message);
    return res.status(400).json({ message: e.message });
  }
};
exports.getAddressById = async (req, res) => {
    try{
        const addressId = req.body;
        const address = await ShippingAddress.findOne({addressId})
        if(!address){
            return res.status(404).json({message: "Address not found"});
        }
        return res.status(200).json({address})
    }catch(e){
        return res.status(400).json({message: e.message})
    }
}

exports.updateAddress = async (req, res) => {
  console.log('req.body;', req.body);

  try {
    const { payload } = req.body;
    if (!payload) {
        return res.status(400).json({ error: "Payload is missing" });
    }

    const { _id, name, address, city, postalCode, country, phoneNumber } = payload;
    
    const userId =  req.body.userId;

    const addressDoc = await ShippingAddress.findOne({ 
      _id: _id, 
      userId 
    });

    if (!addressDoc) {
       return res.status(404).json({ message: "Address not found or unauthorized" });
    }

    addressDoc.name = name;
    addressDoc.address = address;
    addressDoc.city = city;
    addressDoc.postalCode = postalCode;
    addressDoc.country = country;
    addressDoc.phoneNumber = phoneNumber;

    const savedAddress = await addressDoc.save();
    
    return res.status(200).json({ 
        message: "Address updated successfully", 
        address: savedAddress 
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    console.log("req body:", req.body); 
    const { addressId } = req.body.payload; 
    console.log("address ID:", addressId); 
    
    if (!addressId) {
       return res.status(400).json({ error: "Address ID missing in payload" });
    }

    const userId = req.body.userId

    console.log("user ID:", userId); 

    const deletedAddress = await ShippingAddress.findOneAndDelete({
      _id: addressId,
      userId, 
    });

    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found or unauthorized" });
    }

    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};