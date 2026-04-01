const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateReceipt({
  studentName,
  admNo,
  amount,
  txCode,
  date,
  balance,
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filename = `${txCode.replace(/[^a-z0-9]/gi, "_")}.pdf`; // Clean filename
      const receiptPath = path.join(__dirname, "../receipts", filename);

      // Ensure directory exists
      const dir = path.dirname(receiptPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(receiptPath);
      doc.pipe(writeStream);

      // ========== HEADER ==========
      doc
        .fontSize(20)
        .text("School Fees Payment Receipt", { align: "center" })
        .moveDown(1);
      doc
        .fontSize(12)
        .text(`Transaction ID: ${txCode}`)
        .text(`Date: ${date}`)
        .moveDown(1);

      // ========== STUDENT INFO ==========
      doc.fontSize(14).text("Student Information").moveDown(0.5);
      doc
        .fontSize(12)
        .text(`Name: ${studentName}`)
        .text(`Admission Number: ${admNo}`)
        .moveDown(1);

      // ========== PAYMENT ==========
      doc.fontSize(14).text("Payment Details").moveDown(0.5);
      doc
        .fontSize(12)
        .text(`Amount Paid: KES ${amount.toLocaleString()}`)
        .text(`Remaining Balance: KES ${balance.toLocaleString()}`)
        .moveDown(2);
      doc.fontSize(10).text("Thank you for your payment.", { align: "center" });

      doc.end();

      // IMPORTANT: Wait for the file to be fully written
      writeStream.on("finish", () => {
        resolve(receiptPath);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generateReceipt;
