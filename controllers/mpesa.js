const Student = require("../models/student");
const Payment = require("../models/payment");
const { sendPaymentReceipt } = require("../helpers/mailer");

const generateReceipt = require("../helpers/generateReceipt");

const confirmation = async (req, res) => {
  const data = req.body;

  try {
    const billRef = data.BillRefNumber;
    const amount = Number(data.TransAmount);
    const txCode = data.TransID;
    const phone = data.MSISDN;
    const date = data.TransTime;

    // 1️⃣ Find student
    const student = await Student.findOne({ admNo: Number(billRef) }).populate(
      "guardians"
    );

    if (!student) {
      return res.json({ ResultCode: 1, ResultDesc: "Student Not Found" });
    }

    // 2️⃣ Prevent duplicates
    const exists = await Payment.findOne({ mpesa_code: txCode });
    if (exists)
      return res.json({ ResultCode: 0, ResultDesc: "Already Processed" });

    // 3️⃣ Save payment
    await Payment.create({
      student_id: student._id,
      amount,
      mpesa_code: txCode,
      phone,
    });

    // 4️⃣ Calculate balance
    const payments = await Payment.find({ student_id: student._id });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    student.feeBalance = student.totalFees - totalPaid;
    await student.save();

    // 5️⃣ Generate PDF receipt
    const receiptPath = generateReceipt({
      studentName: student.name,
      admNo: student.admNo,
      amount,
      txCode,
      date,
      balance: student.feeBalance,
    });

    // 6️⃣ Email receipt to guardian
    const guardian = student.guardians[0];
    if (guardian && guardian.email) {
      await sendPaymentReceipt({
        to: guardian.email,
        guardianName: guardian.name,
        studentName: student.name,
        amount,
        balance: student.feeBalance,
        txCode,
        receiptPath,
      });
    }

    return res.json({ ResultCode: 0, ResultDesc: "Payment Received" });
  } catch (err) {
    console.error("Error:", err);
    return res.json({ ResultCode: 1, ResultDesc: "Error Processing Payment" });
  }
};

const validation = async (req, res) => {
  console.log("🟡 Validation received:", req.body);

  // Optional: You can reject payments based on custom rules here
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
};

module.exports = { confirmation, validation };
