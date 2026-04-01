const Guardian = require("../models/guardian");
const Student = require("../models/student");

//create new guardian
async function create(req, res) {
  const {
    name,
    dob,
    citizenship,
    id,
    phone,
    email,
    proffession,
    nameOfOrg,
    address,
    poBox,
  } = req.body;

  try {
    // Step 1: Save the guardian document
    const guardian = new Guardian({
      name,
      dob,
      citizenship,
      id,
      phone,
      email,
      proffession,
      nameOfOrg,
      address,
      poBox,
    });

    const savedGuardian = await guardian.save(); // Step 2

    // Step 3: Find the related student
    const studentId = req.params.studentId; // Assuming you have the studentId in the request params
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Step 4: Push the guardian's ID into the student's guardians array
    student.guardians.push(savedGuardian._id);

    // Step 5: Save the updated student document
    await student.save();

    res.json({ message: "Guardian and student updated successfully" });
  } catch (err) {
    console.log(err);
    console.error(err.message);
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0];
      const fieldName = firstError.path;
      message = `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } is required.`;
      statusCode = 400;
    }
    res.status(statusCode).json({ message });
  }
}

//get all guardians
async function get(req, res) {
  let guardian = await Guardian.find();
  res.json(guardian);
}

//get one guardian
function getOne(req, res) {
  let guardianId = req.params.id;
  Guardian.findOne({ _id: guardianId })
    .then((guardianData) => {
      res.json({ guardianData });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error getting guardian!" });
    });
}

//delete a guardian
function deleteGuardian(req, res) {
  let { id } = req.params;
  Guardian.deleteOne({ _id: id })
    .then(() => {
      res.json({ message: "guardian was deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ message: `Error ${err} occured` });
    });
}

//edit a guardian
function edit(req, res) {
  let guardianId = req.params.id;
  let guardianData = req.body;
  Guardian.findOneAndUpdate({ _id: guardianId }, guardianData, { new: true })
    .then((guardianDocument) => {
      console.log(guardianDocument);
      res.json({ message: "guardian was updated successfully!" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error updating guardian!" });
    });
}

module.exports = {
  create,
  get,
  getOne,
  deleteGuardian,
  edit,
};
