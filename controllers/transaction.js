const Transaction = require("../models/transaction");
const Student = require("../models/student");

//create new transaction
async function create(req, res) {
  try {
    const { receiptNo, amount, method, payerName, date } = req.body;
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const idempotencyKey = `${receiptNo}-${amount}-${studentId}`;

    const existing = await Transaction.findOne({ idempotencyKey });

    if (existing) {
      return res.status(409).json({
        message: "Duplicate transaction",
      });
    }

    const transaction = await Transaction.create({
      receiptNo,
      idempotencyKey,
      amount,
      method,
      payerName,
      date,
      student: student._id,
    });

    student.transactions.push(transaction._id);
    student.feeBalance = Math.max(0, student.feeBalance - amount);

    await student.save();

    res.json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate transaction detected",
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

//get all transactions
async function get(req, res) {
  let transaction = await Transaction.find();
  res.json(transaction);
}

//get one transaction
function getOne(req, res) {
  let transactionId = req.params.id;
  Transaction.findOne({ _id: transactionId })
    .then((transactionData) => {
      res.json({ transactionData });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error getting transaction!" });
    });
}

//delete a transaction
function deletetransaction(req, res) {
  let { id } = req.params;
  Transaction.deleteOne({ _id: id })
    .then(() => {
      res.json({ message: "transaction was deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ message: `Error ${err} occured` });
    });
}

//edit a transaction
function edit(req, res) {
  let transactionId = req.params.id;
  let transactionData = req.body;
  Transaction.findOneAndUpdate({ _id: transactionId }, transactionData, {
    new: true,
  })
    .then((transactionDocument) => {
      console.log(transactionDocument);
      res.json({ message: "transaction was updated successfully!" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error updating transaction!" });
    });
}

module.exports = {
  create,
  get,
  getOne,
  deletetransaction,
  edit,
};
