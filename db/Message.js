const mongoose = require('mongoose')

let MessageSchema = new mongoose.Schema({
    name: String,
    body: String
})

module.exports = mongoose.model('Message', MessageSchema)