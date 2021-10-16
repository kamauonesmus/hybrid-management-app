// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    entryDate: {
        type: Date,
        required: true,
        default: Date.now
    }
},
 {
    collection: 'users'
})

userSchema.plugin(uniqueValidator, { message: 'Email already in use.' });

module.exports = mongoose.model('User', userSchema)