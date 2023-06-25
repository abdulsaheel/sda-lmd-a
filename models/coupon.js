const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  storeName: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Coupon', couponSchema);
