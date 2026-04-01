const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateMonthlyStatement({ student, payments, monthName, totalFees }) {
  const doc = new PDFDocument({ margin: 50 });

  const fileName = `${student.admNo}-${monthName}-statement.pdf`;
  const filePath = path.join(__dirname, "../statements", fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Logo
  const logoPath = path.join(__dirname, "../assets/logo.jpeg");
  doc.image(logoPath, 50, 20, { width: 80 });

  // Title
  doc
    .fontSize(22)
    .text(`Monthly Statement – ${monthName}`, 0, 120, { align: "center" })
    .moveDown();

  // Student Info
  doc
    .fontSize(14)
    .text("Student Information", { underline: true })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .text(`Name: ${student.name}`)
    .text(`Admission No: ${student.admNo}`)
    .text(`Total School Fees: KES ${totalFees}`)
    .moveDown(1);

  // Payment Table Header
  doc
    .fontSize(14)
    .text("Payments This Month", { underline: true })
    .moveDown(0.5);

  // Table columns
  doc
    .fontSize(12)
    .text("Date", 50)
    .text("MPESA Code", 200)
    .text("Amount (KES)", 400)
    .moveDown(0.5);

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  // Payment Rows
  let totalPaid = 0;

  payments.forEach((p) => {
    doc.moveDown(0.3);
    doc
      .text(new Date(p.created_at).toLocaleDateString(), 50)
      .text(p.mpesa_code, 200)
      .text(p.amount.toString(), 400);
    totalPaid += p.amount;
  });

  doc.moveDown(1);

  // Summary
  const balance = totalFees - totalPaid;

  doc.fontSize(14).text("Summary", { underline: true }).moveDown(0.5);

  doc
    .fontSize(12)
    .text(`Total Paid This Month: KES ${totalPaid}`)
    .text(`Closing Balance: KES ${balance}`)
    .moveDown(2);

  doc.end();

  return filePath;
}

module.exports = generateMonthlyStatement;
