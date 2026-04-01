const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  admNo: {
    type: Number,
    unique: true,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  birthCertNo: {
    type: String,
    unique: true,
  },
  familyDoc: {
    type: String,
  },
  familyDocNo: {
    type: Number,
  },
  medicalCondition: {
    type: Boolean,
    required: true,
  },
  explainCondition: {
    type: String,
  },
  totalFees: {
    type: Number,
    required: true,
    default: 0,
  },

  feeBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
    },
  ],
  guardians: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "guardian",
    },
  ],
  //person responsible for picking the child
  persons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "person",
    },
  ],
  //person to be contacted in case of emergency
  emergencyContacts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "person",
    },
  ],
});

const studentModel = mongoose.model("student", studentSchema);

module.exports = studentModel;
