const Student = require('../models/student');
const Payment = require('../models/Payment');

module.exports = {
  getStudentByAdmNo: async (admNo) => {
    // admNo may be string from M-Pesa; parse to Number
    const num = Number(admNo);
    return await Student.findOne({ admNo: num }).populate('guardians').exec();
  },

  savePayment: async ({ studentId, amount, mpesaCode, phone }) => {
    return await Payment.create({
      student_id: studentId,
      amount,
      mpesa_code: mpesaCode,
      phone
    });
  },

  sumPayments: async (studentId) => {
    const result = await Payment.aggregate([
      { $match: { student_id: studentId } },
      { $group: { _id: null, totalPaid: { $sum: "$amount" } } }
    ]);
    return result.length ? result[0].totalPaid : 0;
  }
};
