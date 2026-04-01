const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  payerName: { type: String, required: true },
  amount: { type: Number, required: true },
  receiptNo: { type: String, required: true, unique: true },
  method: { type: String, default: "Equity Paybill" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("payment", paymentSchema);
