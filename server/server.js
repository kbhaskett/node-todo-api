const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');


const {mongoose} = require('../db/mongoose');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');


var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todo', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        return res.status(201).send(doc);
    }, (err) => {
        return res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) =>{
        return res.send({todos});
    }, (e) => {
        return res.status(400).send(e);
    })
})

app.get('/todo/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid Id passed');
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        } else {
            return res.send({todo});
        }
    }, (err) => {
        return res.status(400).send('Problems retrieving this item');
    });
});

app.delete('/todo/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid Id passed');
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        } else {
            return res.send({todo});
        }
    }, (err) => {
        return res.status(400).send('Problems deleting this item');
    });
});

app.patch('/todo/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send('Invalid Id passed');
    }

    var body = _.pick(req.body, ['text', 'completed']);

    if (!_.isBoolean(body.completed)) {
        return res.status(400).send('Invalid completed value');
    }
    
    body.completedAt = body.completed ? new Date() : null;

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports.app = app;