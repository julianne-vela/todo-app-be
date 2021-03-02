require('dotenv').config();
const { execSync } = require('child_process');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
    describe('routes', () => {
        let token;
  
        beforeAll(async done => {
            execSync('npm run setup-db');
  
            client.connect();
  
            const signInData = await fakeRequest(app)
                .post('/auth/signup')
                .send({
                    email: 'cjvela1@outlook.com',
                    password: '123456'
                });
      
      token = signInData.body.token; // eslint-disable-line

            return done();
        });
  
        afterAll(done => {
            return client.end(done);
        });

        const todo = {
            todo: 'walk the dog',
            completed: false,
        };

        const dbTodo = {
            ...todo,
            user_id: 2,
            id: 4,
        };

        test('create a new todo as the test user', async() => {
            const todo = {
                todo: 'walk the dog',
                completed: false,
            };

            const data = await fakeRequest(app)
                .post('/api/todos')
                .send(todo)
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(data.body).toEqual(dbTodo);
        });
        
        test('gets a list of all todos for the given user', async() => {
            const todos = [{
                todo: 'walk the dog',
                completed: false,
                user_id: 2,
                id: 4,
            }];

            const data = await fakeRequest(app)
                .get('/api/todos')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(data.body).toEqual(todos);
        });

        test('updates a todo to "true" for the given user', async() => {
            const updatedTodo = {
                todo: 'walk the dog',
                completed: true,
                user_id: 2,
                id: 4,
            };

            const update = await fakeRequest(app)
                .put('/api/todos/4')
                .send(updatedTodo)
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(200);

                console.log(update.body);
            const updatedData = await fakeRequest(app)
                .get('/api/todos/4')
                .set('Authorization', token)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(updatedData.body).toEqual(updatedTodo);
        });
    });
});
