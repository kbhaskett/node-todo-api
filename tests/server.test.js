const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server/server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todo', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todo')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(201)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todo')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({
            createdBy: users[0]._id
        }).then((todos) => {
          expect(todos.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todo/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todo/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 when not a doc created by user', (done) => {
    request(app)
      .get(`/todo/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todo/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todo/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(400)
      .end(done);
  });
});

describe('DELETE /todo/:id', () => {
    it('should remove todo doc', (done) => {
        request(app)
          .delete(`/todo/${todos[1]._id.toHexString()}`)
          .set('x-auth', users[1].tokens[0].token)
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.text).toBe(todos[1].text);
          })
          .end((err, res) => {
            if (err) return done(err);
            Todo.findById(todos[1]._id.toHexString()).then((todo) => {
                expect(todo).toBeNull();
                done();
            }).catch((err) => done(err));
        });
    });
    
    it('should not remove todo doc if not the creator', (done) => {
        request(app)
          .delete(`/todo/${todos[1]._id.toHexString()}`)
          .set('x-auth', users[0].tokens[0].token)
          .expect(404)
          .end((err, res) => {
            if (err) return done(err);
            Todo.findById(todos[1]._id.toHexString()).then((todo) => {
                expect(todo).not.toBeNull();
                done();
            }).catch((err) => done(err));
        });
    });
    
    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
    
        request(app)
          .delete(`/todo/${hexId}`)
          .set('x-auth', users[1].tokens[0].token)
          .expect(404)
          .end(done);
      });
    
    it('should return 404 for non-object ids', (done) => {
        request(app)
          .delete('/todo/123abc')
          .set('x-auth', users[1].tokens[0].token)
          .expect(400)
          .end(done);
    });
});

describe('PATCH /tood/:id', () => {
    it('should update the todo', (done) => {
        var text = 'Updated text';
        var completed = true;
        request(app)
        .patch(`/todo/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({text, completed})
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(text);
          expect(res.body.todo.completed).toBe(true);
          expect(res.body.todo.completedAt).toExist;
        })
        .end(done);
    });

    it('should not update the todo if not the creator', (done) => {
        var text = 'Updated text';
        var completed = true;
        request(app)
        .patch(`/todo/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({text, completed})
        .expect(404)
        .end(done);
    });

    it('should clear the completedAt', (done) => {
        var text = 'Updated text';
        var completed = false;
        request(app)
        .patch(`/todo/${todos[1]._id.toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({text, completed})
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(text);
          expect(res.body.todo.completed).toBe(false);
          expect(res.body.todo.completedAt).toBeNull;
        })
        .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        var text = 'some text';
        var completed = false;
    
        request(app)
          .patch(`/todo/${hexId}`)
          .set('x-auth', users[0].tokens[0].token)
          .send({text, completed})
          .expect(404)
          .end(done);
    });
    
    it('should return 404 for non-object ids', (done) => {
        var text = 'some text';
        var completed = false;
        request(app)
          .patch('/todo/123abc')
          .set('x-auth', users[0].tokens[0].token)
          .send({text, completed})
          .expect(400)
          .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return a user if authenticated', (done) => {
        request(app)
          .get('/users/me')
          .set('x-auth', users[0].tokens[0].token)
          .expect(200)
          .expect((res) => {
              expect(res.body._id).toBe(users[0]._id.toHexString());
              expect(res.body.email).toBe(users[0].email);
          })
          .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {
        request(app)
          .get('/users/me')
          .expect(401)
          .expect((res) => {
              expect(res.body._id).toNotExist;
          })
          .end(done);
    })
});

describe('POST /user', () => {
    it('should create a user when valid data is sent', (done) => {
        var email = 'joeyb@example.com';
        var password = 'AbCD&334';
        request(app)
          .post('/user')
          .send({email, password})
          .expect(201)
          .expect((res) => {
            expect(res.body.email).toBe(email);
            expect(res.body._id).toExist;
            expect(res.headers['x-auth']).toExist;
          })
          .end((err) => {
              if (err) return done(err);
              User.findOne({email}).then((user) => {
                  expect(user).toExist;
                  expect(user.password).not.toBe(password);
                  done();
              }).catch((err) => done(err));
          });
    });

    it('should return validation errors if email is invalid', (done) => {
        var invalidEmail = 'joeyb@';
        var password = 'AbCD&334';
        request(app)
          .post('/user')
          .send({invalidEmail, password})
          .expect(400)
          .expect((res) => {
            expect(res.body._message).toBe('User validation failed');
          })
          .end(done);
    });

    it('should return validation errors if password is invalid', (done) => {
        var email = 'joeyb@example.com';
        var invalidPassword = 'abc';
        request(app)
          .post('/user')
          .send({email, invalidPassword})
          .expect(400)
          .expect((res) => {
            expect(res.body._message).toBe('User validation failed');
          })
          .end(done);
    });

    it('should return validation errors if email is in use', (done) => {
        var email = 'user1pass@example.com';
        var password = 'abc1234';
        request(app)
          .post('/user')
          .send({email, password})
          .expect(400)
          .expect((res) => {
            expect(res.body.errmsg).toContain('duplicate key');
          })
          .end(done);
    });
});
describe('POST /userlogin', () => {
    it('should send 200 and auth token if proper credentials passed', (done) => {
        request(app)
          .post('/user/login')
          .send({
              email: users[1].email,
              password: users[1].password
          })
          .expect(200)
          .expect((res) => {
              expect(res.headers['x-auth']).toExist;
          })
          .end((err, res) => {
              if (err) return done(err);

              User.findById(users[1]._id).then((user) => {
                expect(user.tokens[1]).toMatchObject({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();
              }).catch((e) => done(e));
          });
    });

    it('should send 400 if incorrrect email passed', (done) => {
        request(app)
          .post('/user/login')
          .send({
              email: users[1].email,
              password: 'abc123def'
          })
          .expect(400)
          .expect((res) => {
              expect(res.headers['x-auth']).not.toExist;
          })
          .end(done);
    });

    it('should send 400 if incorrrect email passed', (done) => {
        request(app)
          .post('/user/login')
          .send({
              email: 'abcc@example.com',
              password: users[1].password
          })
          .expect(400)
          .expect((res) => {
              expect(res.headers['x-auth']).not.toExist;
          })
          .end(done);
    });
});