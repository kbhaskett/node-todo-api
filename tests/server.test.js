const expect = require('expect');
const request = require('supertest');

const {app} = require('../server/server');
const {Todo} = require('../models/todo');

beforeEach((done) => {
    Todo.remove({}).then(() => done());
});

describe('POST  /todo', () => {
    it('should create a new todo', (done) => {
        var text = 'Testing data';

        request(app).post('/todo').send({text})
        .expect(201)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((err) => done(err));
        });
    });

    it('should not create Todo with bad data', (done) => {
        request(app).post('/todo').send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(0);
                done();
            }).catch((err) => done(err));
        });
     })
});