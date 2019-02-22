const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bycrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    // firstName: {
    //     type: String,
    //     required: true
    // },
    // lastName: {
    //     type: String,
    //     required: true
    // },
    email: {
        type: String,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email address'
        },
        minLength: 4,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.updateOne({
        $pull: {
            tokens: {token}
        }
    });
};

UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decode;

    try {
        decode = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decode._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function(email, password) {
    var user = this;

    return User.findOne({email}).then((user) => {
        if (!user) return Promise.reject();
        return new Promise((resolve, reject) => {
            bycrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else { 
                    reject();
                }
            });
        });
    });
};

UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bycrypt.genSalt(10, (err, salt) => {
            bycrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};