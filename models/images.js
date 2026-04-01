const mongoose = require('mongoose')

const imgSchema = mongoose.Schema({
    data: Buffer,
    contentType: String,
})

const imgModel = mongoose.model('image', imgSchema)

module.exports = imgModel