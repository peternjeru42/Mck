const Student = require('../models/student')

//create new student
function create(req, res) {
    console.log(req)
    const {
        name,
        admNo,
        gender,
        dob,
        birthCertNo,
        familyDoc,
        familyDocNo,
        medicalCondition,
        explainCondition,
        guardians,
        persons,
        emergencyContacts } = req.body;
    const student = new Student({
        name,
        admNo,
        gender,
        dob,
        birthCertNo,
        familyDoc,
        familyDocNo,
        medicalCondition,
        explainCondition,
        guardians,
        persons,
        emergencyContacts
    });
    student
        .save()
        .then((studentDocument) => {
            res.send(studentDocument)
        })
        .catch((err) => {
            console.error(err);
            let statusCode = 500;
            let message = "Error saving student!";

            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0];
                const fieldName = firstError.path;
                message = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
                statusCode = 400;
            } else if (err.code === 11000 && err.keyPattern) {
                if (err.keyPattern.admNo) {
                    message = "Duplicate admission number. Please use a unique admission number.";
                } else if (err.keyPattern.birthCertNo) {
                    message = "Duplicate birth certificate number. Please use a unique birth certificate number.";
                }
                statusCode = 400;
            }

            res.status(statusCode).json({ message });
        });

}

//get all students
async function get(req, res) {
    let student = await Student
        .find()
    res.json(student);
}

//get one student
async function getOne(req, res) {
    try {
        let studentId = req.params.id;
        const studentData = await Student
            .findOne({ _id: studentId })
        res.json({ studentData })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error getting student!" });
    }
}

//delete a student
function deleteStudent(req, res) {
    let { id } = req.params;
    Student.deleteOne({ _id: id })
        .then(() => {
            res.json({ message: "Student was deleted successfully" });
        })
        .catch((err) => {
            res.status(500).json({ message: `Error ${err} occured` });
        });
}

//edit a student
function edit(req, res) {
    let studentId = req.params.id;
    let studentData = req.body;
    Student.findOneAndUpdate({ _id: studentId }, studentData, { new: true })
        .then((studentDocument) => {
            console.log(studentDocument);
            res.json({ message: "student was updated successfully!" });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Error updating student!" });
        });
}


module.exports = {
    create,
    get,
    getOne,
    deleteStudent,
    edit
}