const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');


const {mongoose} = require('../db/mongoose');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {authenticate} = require('../middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todo', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        createdBy: req.user._id
    });

    todo.save().then((doc) => {
        return res.status(201).send(doc);
    }, (err) => {
        return res.status(400).send(err);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        createdBy: req.user._id
    }).then((todos) =>{
        return res.send({todos});
    }, (e) => {
        return res.status(400).send(e);
    })
})

app.get('/todo/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid Id passed');
    }

    Todo.findOne({
        _id: id,
        createdBy: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        } else {
            return res.send({todo});
        }
    }, (err) => {
        return res.status(400).send('Problems retrieving this item');
    });
});

app.delete('/todo/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid Id passed');
    }

    Todo.findOneAndRemove({
        _id: id,
        createdBy: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        } else {
            return res.send({todo});
        }
    }, (err) => {
        return res.status(400).send('Problems deleting this item');
    });
});

app.patch('/todo/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid Id passed');
    }

    var body = _.pick(req.body, ['text', 'completed']);

    if (!_.isBoolean(body.completed)) {
        return res.status(400).send('Invalid completed value');
    }
    
    body.completedAt = body.completed ? new Date() : null;

    Todo.findOneAndUpdate({
        _id: id,
        createdBy: req.user._id
     }, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
          return res.status(404).send();
        }
        return res.send({todo});
    }, (err) => {
        return res.status(400).send('Problems updating this item');
    });
});

app.post('/user', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User({
        email: body.email,
        password: body.password
    });

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        return res.header('x-auth', token).status(201).send(user);
    }).catch((err) => {
        return res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/user/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User({
        email: body.email,
        password: body.password
    });

    User.findByCredentials(user.email, user.password).then((user) => {
        return user.generateAuthToken();
    }).then((token) => {
        return res.header('x-auth', token).send(user);
    }).catch((err) => {
        return res.status(400).send();
    });
});

app.delete('/user/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports.app = app;