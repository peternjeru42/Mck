const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    receiptNo: String,

    // ✅ Safe idempotency key (instead of relying on TransID)
    idempotencyKey: {
      type: String,
      unique: true,
    },

    amount: Number,
    method: String,
    payerName: String,
    date: Date,

    // Optional but recommended
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
