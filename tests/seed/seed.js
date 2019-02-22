const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'user1pass@example.com',
    password: 'user1pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'hockeysticks').toString()
    }]
},{
    _id: userTwoId,
    email: 'user2pass@example.com',
    password: 'user2pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, 'hockeysticks').toString()
    }]
}];
const populateUsers = (done) => {
    User.deleteMany({}).then(()=> {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    createdBy: users[0]._id
  }, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: new Date(),
    createdBy: users[1]._id
  }];
  
const populateTodos = (done) => {
    Todo.deleteMany({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};