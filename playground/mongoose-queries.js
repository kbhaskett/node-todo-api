const {mongoose} = require('../server/server');
const {Todo} = require('../models/todo');

var id = '5c65de42cf976686fca229d6';

Todo.find({
    _id: id
}).then((todos) => {
    console.log('Todos:', todos);
});

Todo.findOne({
    _id: id
}).then((todo) => {
    console.log('Todo:', todo);
});

Todo.findById(id).then((todo) => {
    console.log('Todo by Id:', todo);
});