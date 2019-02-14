var mongoose = require('mongoose');

var User = mongoose.model('User', {
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        minLength: 4,
        trim: true
    }
});

module.exports = {User};