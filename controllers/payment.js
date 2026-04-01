const Payment = require("../models/payment");
const Student = require("../models/student");
const Transaction = require("../models/transaction");
const { sendPaymentReceipt } = require("../helpers/mailer"); // Adjusted to your file name
const generateReceipt = require("../helpers/generateReceipt"); // Your PDF function
/**
 * JENGA CALLBACK (IPN)
 * Triggered automatically by JengaHQ when a transaction occurs
 */
// const { generatePDF } = require("./pdfService"); // Assume you have a PDF generator

const paymentCallback = async (req, res) => {
  try {
    const { transaction, customer, bank } = req.body;

    // 1. Clean Data
    const receiptNo = transaction?.reference?.trim();
    const amount = parseFloat(transaction?.amount);
    const rawCustomerRef = customer?.reference || "";
    const admNo = rawCustomerRef.trim().split(" ")[0];
 
    // 2. Filter Success Credits
    if (
      bank?.transactionType !== "Credit" ||
      transaction?.status !== "SUCCESS"
    ) {
      return res
        .status(200)
        .json({ message: "Ignoring non-credit or failed transaction" });
    }

    // 3. Duplicate Check
    const existingTx = await Transaction.findOne({ receiptNo });
    if (existingTx) {
      return res.status(200).json({ message: "Transaction already processed" });
    }

    // 4. Find Student & Populate Guardians
    const student = await Student.findOne({ admNo }).populate("guardians");
    if (!student) {
      console.error(`[Error] Student ${admNo} not found`);
      return res
        .status(200)
        .json({ status: "FAILED", message: "Student not found" });
    }

    // 5. Create Transaction Record
    const idempotencyKey = `${receiptNo}-${amount}-${student._id}`;
    const newTx = await Transaction.create({
      receiptNo,
      idempotencyKey,
      amount,
      method: transaction?.paymentMode || "Equity/Jenga",
      payerName: customer?.name || "Equity Customer",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      student: student._id,
    });

    // 6. Update Student Balance
    student.feeBalance = Math.max(0, student.feeBalance - amount);
    student.transactions.push(newTx._id);
    await student.save();

    // 7. Background: Generate PDF & Send Email
    // We don't 'await' this block so we can respond to Jenga immediately
    if (student.guardians && student.guardians.length > 0) {
      const guardian = student.guardians[0];

      if (guardian.email) {
        (async () => {
          try {
            // STEP A: Wait for the PDF to be physically written to disk
            const pdfPath = await generateReceipt({
              studentName: student.name,
              admNo: student.admNo,
              amount: amount,
              txCode: receiptNo,
              date: new Date().toLocaleDateString(),
              balance: student.feeBalance,
            });

            // STEP B: Send the email with the actual file path
            await sendPaymentReceipt({
              to: guardian.email,
              guardianName: guardian.name,
              studentName: student.name,
              amount: amount,
              balance: student.feeBalance,
              txCode: receiptNo,
              receiptPath: pdfPath,
            });

            console.log(`✅ Receipt emailed to: ${guardian.email}`);
          } catch (err) {
            console.error("❌ Background Receipt Error:", err);
          }
        })();
      }
    }

    // 8. Immediate Success Response
    console.log(`✅ Payment Applied: KES ${amount} for ${student.name}`);
    return res.status(200).json({
      status: "SUCCESS",
      message: "Payment recorded successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: "Duplicate detected" });
    }
    console.error("CRITICAL CALLBACK ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
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
