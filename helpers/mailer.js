// mailer.js
const nodemailer = require("nodemailer");

const emailEnabled = process.env.EMAIL_ENABLED !== "false";

const transporter =
  emailEnabled && process.env.EMAIL && process.env.EMAIL_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      })
    : null;

async function sendPaymentReceipt({
  to,
  guardianName,
  studentName,
  amount,
  balance,
  txCode,
  receiptPath,
}) {
  if (!emailEnabled) {
    console.log("Email sending skipped because EMAIL_ENABLED=false");
    return { skipped: true };
  }

  if (!transporter) {
    console.log("Email sending skipped because email credentials are missing.");
    return { skipped: true };
  }

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
