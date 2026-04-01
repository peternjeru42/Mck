//environment configuration
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

//create express app
const app = express();

const defaultOrigins = [
  "http://localhost:3001",
  "https://convinientlyai.vercel.app",
];

const allowedOrigins = (
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : defaultOrigins
)
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

//route handlers
const studentRoutes = require("./routes/student");
const guardianRoutes = require("./routes/guardian");
const personRoutes = require("./routes/person");
const imgRoutes = require("./routes/images");
const emergencyContactRoutes = require("./routes/emergency-contact");
const mpesaRoutes = require("./routes/mpesa");
const monthlyStatementsRoutes = require("./routes/payment");
// const registerURLs = require("./helpers/registerMpesaUrls");
const payment = require("./routes/payment");

app.use("/student", studentRoutes);
app.use("/guardian", guardianRoutes);
app.use("/person", personRoutes);
app.use("/image", imgRoutes);
app.use("/emergency-contact", emergencyContactRoutes);
app.use("/mpesa", mpesaRoutes);
app.use("/statement", monthlyStatementsRoutes);
app.use("/payment", payment);

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Your backend is running correctly." });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// registerURLs(); this was registering mpesa routes

//database connection
require("./helpers/mongo-connection");

//server listening
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
