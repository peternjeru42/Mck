const Payment = require("../models/payment");
const Student = require("../models/student");
const Transaction = require("../models/transaction");

/**
 * JENGA CALLBACK (IPN)
 * Triggered automatically by JengaHQ when a transaction occurs
 */
const paymentCallback = async (req, res) => {
  try {
    const { transaction, customer, bank } = req.body;

    const receiptNumber = transaction?.reference?.trim();
    const amount = parseFloat(transaction?.amount);
    const rawRef = customer?.reference || "";
    const admNo = rawRef.trim().split(" ")[0];

    if (bank?.transactionType !== "Credit") {
      return res
        .status(200)
        .json({ message: "Ignoring non-credit transaction" });
    }

    if (!receiptNumber || isNaN(amount) || !admNo) {
      console.error("Malformed payload:", req.body);
      return res.status(400).json({ error: "Missing required fields" });
    }

    const student = await Student.findOne({ admNo });

    if (!student) {
      return res.status(200).json({
        status: "FAILED",
        message: "Student not found",
      });
    }

    // ✅ FIX: smarter duplicate check (no schema change)
    const existing = await Transaction.findOne({
      receiptNo: receiptNumber,
      amount: amount,
      payerName: customer?.name || "Equity Customer",
    });

    if (existing) {
      return res.status(200).json({
        message: "Transaction already processed",
      });
    }

    // ✅ FIX: ensure TransID is NEVER null
    const safeTransId = `${receiptNumber}-${Date.now()}`;

    await Transaction.create({
      receiptNo: receiptNumber,
      TransID: safeTransId, // 👈 prevents Mongo crash
      amount: amount,
      method: "Equity/Jenga",
      payerName: customer?.name || "Equity Customer",
      date: new Date(transaction?.date || Date.now()),
    });

    // ✅ update balance safely
    student.feeBalance -= amount;
    await student.save();

    console.log(`✅ Payment of ${amount} applied to Student: ${student.admNo}`);

    res.status(200).json({
      status: "SUCCESS",
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("CALLBACK ERROR:", error);

    // ✅ VERY IMPORTANT: don't crash on duplicates
    if (error.code === 11000) {
      return res.status(200).json({
        message: "Duplicate ignored",
      });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * MANUAL PAYMENT CREATION
 * Used for cash payments or manual office entries
 */
async function create(req, res) {
  const { payername, amount, receiptNo, method, date } = req.body;
  const studentId = req.params.studentId;

  try {
    const payment = new Payment({ payername, amount, receiptNo, method, date });
    const savedpayment = await payment.save();

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.payments.push(savedpayment._id);
    student.feeBalance -= parseFloat(amount); // Keep balance in sync
    await student.save();

    res.json({ message: "Payment and student updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving payment!" });
  }
}

/**
 * GET ALL PAYMENTS
 */
async function get(req, res) {
  try {
    let payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments" });
  }
}

/**
 * GET ONE PAYMENT
 */
function getOne(req, res) {
  let paymentId = req.params.id;
  Payment.findById(paymentId)
    .then((paymentData) => {
      if (!paymentData)
        return res.status(404).json({ message: "Payment not found" });
      res.json({ paymentData });
    })
    .catch((err) => {
      res.status(500).json({ message: "Error getting payment!" });
    });
}

/**
 * DELETE PAYMENT
 */
function deletepayment(req, res) {
  let { id } = req.params;
  Payment.deleteOne({ _id: id })
    .then(() => res.json({ message: "Payment deleted successfully" }))
    .catch((err) =>
      res.status(500).json({ message: "Error deleting payment" }),
    );
}

/**
 * EDIT PAYMENT
 */
function edit(req, res) {
  let paymentId = req.params.id;
  let paymentData = req.body;
  Payment.findOneAndUpdate({ _id: paymentId }, paymentData, { new: true })
    .then(() => res.json({ message: "Payment updated successfully!" }))
    .catch((err) =>
      res.status(500).json({ message: "Error updating payment!" }),
    );
}

/**
 * TEST PAYMENT (SIMULATOR)
 */
const testPayment = async (req, res) => {
  try {
    const { admNo, amount } = req.body;
    if (!admNo || !amount)
      return res.status(400).json({ message: "admNo and amount required" });

    const student = await Student.findOne({ admNo });
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.feeBalance -= amount;
    student.payments.push({
      amount,
      method: "Manual Test",
      date: new Date(),
    });

    await student.save();
    res.json({
      message: "Test applied successfully",
      balance: student.feeBalance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  create,
  get,
  getOne,
  deletepayment,
  edit,
  testPayment,
  paymentCallback,
};
