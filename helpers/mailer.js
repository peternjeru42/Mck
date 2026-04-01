// mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendPaymentReceipt({
  to,
  guardianName,
  studentName,
  amount,
  balance,
  txCode,
  receiptPath,
}) {
  const html = `
    <h2>Payment Confirmation</h2>
    <p>Dear ${guardianName},</p>
    <p>We have received payment for <b>${studentName}</b>.</p>
    <ul>
      <li><b>Amount:</b> KES ${amount}</li>
      <li><b>Transaction ID:</b> ${txCode}</li>
      <li><b>Remaining Balance:</b> KES ${balance}</li>
    </ul>

    <p>Your official receipt is attached as a PDF.</p>
    <p>Thank you.</p>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "School Fees Receipt",
    html,
    attachments: [
      {
        filename: `${txCode}.pdf`,
        path: receiptPath,
      },
    ],
  });
}

module.exports = { sendPaymentReceipt };
