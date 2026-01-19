const Order = require("../models/order");
const Cart = require("../models/cart");
const https = require('https');

exports.addOrder = async (req, res) => {
  try {
    const { addressId, totalAmount, items, paymentStatus, paymentType, paymentReference } = req.body;

    if (paymentType === 'card' && paymentReference) {
       const isPaymentVerified = await verifyPaystack(paymentReference);
       
       if (!isPaymentVerified) {
         return res.status(400).json({ error: "Payment verification failed. Order not placed." });
       }
    }

    // --- STEP 2: Create the Order ---
    const order = new Order({
      user: req.user._id,
      addressId,
      totalAmount,
      items,
      paymentStatus: paymentType === 'card' ? 'completed' : 'pending',
      paymentType,
      paymentInfo: {
        reference: paymentReference || null,
        status: paymentType === 'card' ? 'success' : 'pending'
      },
      orderStatus: [
        {
          type: "ordered",
          date: new Date(),
          isCompleted: true,
        },
        {
          type: "packed",
          isCompleted: false,
        },
        {
          type: "shipped",
          isCompleted: false,
        },
        {
          type: "delivered",
          isCompleted: false,
        },
      ],
    });

    const savedOrder = await order.save();

    // --- STEP 3: Clear the User's Cart (Optional but recommended) ---
    await Cart.deleteOne({ user: req.user._id });

    return res.status(201).json({ order: savedOrder });

  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

// Helper function to verify Paystack Reference
const verifyPaystack = (reference) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer sk_test_xxxxxxxxxxxxxxxxxxxxxx`, // ⚠️ PUT YOUR SECRET KEY HERE
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const responseData = JSON.parse(data);
        if (responseData.status && responseData.data.status === 'success') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error(e);
      resolve(false);
    });
    req.end();
  });
};