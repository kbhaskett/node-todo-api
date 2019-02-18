var express = require('express');
var bodyParser = require('body-parser');
var ObjectId = require('mongoose').Types.ObjectId;


var {mongoose} = require('../db/mongoose');
var {Todo} = require('../models/todo');
var {User} = require('../models/user');

var app = express();
const port = process.env.PORT || 3000;

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
    if (!ObjectId.isValid(id)) {
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
    if (!ObjectId.isValid(id)) {
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports.app = app;