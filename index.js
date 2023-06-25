const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://abdulsaheel81:saheel123@test.3kitbnq.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

// Define the Coupon schema
const couponSchema = new mongoose.Schema({
  couponCode: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  storeName: { type: String, required: true } // Add storeName field to the schema
});

// Create the Coupon model
const Coupon = mongoose.model('Coupon', couponSchema);

// Define the Store schema
const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  password: { type: String, required: true }
});

// Create the Store model
const Store = mongoose.model('Store', storeSchema);

let sequentialCode = 1000; // Initial sequential code

// Route to save the coupon
app.post('/coupons', (req, res) => {
  const { amount, storeName } = req.body; // Retrieve storeName from the request body

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });

  const couponCode = generateCouponCode(amount, storeName, formattedDate);

  const newCoupon = new Coupon({
    couponCode: couponCode,
    amount: amount,
    date: currentDate,
    storeName: storeName // Assign storeName to the coupon
  });

  newCoupon.save()
    .then((coupon) => {
      res.status(200).json({ coupon: coupon.toObject(), message: 'Coupon saved successfully' });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to save coupon' });
    });
});

// Route to save store credentials
app.post('/stores', (req, res) => {
  const { storeName, password } = req.body;

  const newStore = new Store({
    storeName: storeName,
    password: password
  });

  newStore.save()
    .then(() => {
      res.status(200).json({ message: 'Store credentials saved successfully' });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to save store credentials' });
    });
});

app.post('/login', (req, res) => {
  const { storeName, password } = req.body;

  Store.findOne({ storeName: storeName, password: password })
    .then((store) => {
      if (store) {
        res.status(200).json({ isValid: true }); // Update the response to send { isValid: true }
      } else {
        res.status(401).json({ isValid: false }); // Update the response to send { isValid: false }
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to perform store login' });
    });
});

// Generate the coupon code
function generateCouponCode(amount, storeName, formattedDate) {
  const code = sequentialCode.toString().padStart(4, '0'); // Convert sequential code to a 4-digit string
  sequentialCode++; // Increment the sequential code for the next coupon
  const dateWithoutSlash = formattedDate.replace('/', ''); // Remove the slash from the date
  const couponCode = `${code}${storeName}${amount}${dateWithoutSlash}`; // Include storeName in the coupon code
  return couponCode;
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
