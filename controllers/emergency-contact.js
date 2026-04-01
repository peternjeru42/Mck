const Person = require('../models/person')
const Student = require('../models/student')

//create new person for emergency contacts
async function create(req, res) {
    const { name, phone, } = req.body;

    try {
        // Step 1: Save the person document
        const person = new Person({ name, phone, });

        const savedperson = await person.save(); // Step 2

        // Step 3: Find the related student
        const studentId = req.params.studentId; // Assuming you have the studentId in the request params
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Step 4: Push the person's ID into the student's persons array
        student.emergencyContacts.push(savedperson._id);

        // Step 5: Save the updated student document
        await student.save();

        res.json({ message: "person and student updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving person and updating student!" });
    }
}

//get all persons
async function get(req, res) {
    let person = await Person.find();
    res.json(person);
}

//get one person
function getOne(req, res) {
    let personId = req.params.id;
    Person.findOne({ _id: personId })
        .then((personData) => {
            res.json({ personData });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Error getting person!" });
        });
}

//delete a person
function deletePerson(req, res) {
    let { id } = req.params;
    Person.deleteOne({ _id: id })
        .then(() => {
            res.json({ message: "person was deleted successfully" });
        })
        .catch((err) => {
            res.status(500).json({ message: `Error ${err} occured` });
        });
}

//edit a person
function edit(req, res) {
    let personId = req.params.id;
    let personData = req.body;
    Person.findOneAndUpdate({ _id: personId }, personData, { new: true })
        .then((personDocument) => {
            console.log(personDocument);
            res.json({ message: "person was updated successfully!" });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Error updating person!" });
        });
}


module.exports = {
    create,
    get,
    getOne,
    deletePerson,
    edit,
}