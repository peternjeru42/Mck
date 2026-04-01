const mongoose = require('mongoose')

const guardianSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    citizenship: {
        type: String,
        required: true
    },
    //id or passport number
    id: {
        type: Number,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    proffesion: {
        type: String,
    },
    //organization or company where they work
    nameOfOrg: {
        type: String,
    },
    address: {
        type: String,
        required: true,
    },
    poBox: {
        type: String,
    },
  
})

const guardianModel = mongoose.model('guardian', guardianSchema)

module.exports = guardianModel