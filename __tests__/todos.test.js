const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const Todo = require('../lib/models/Todo');
//const Todo = require('../lib/models/Todo');

const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: '123456',
};
const mockUser2 = {
  firstName: 'Test',
  lastName: 'User 2',
  email: 'test2@example.com',
  password: '123456',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test
  const agent = request.agent(app);

  // Create a user to sign in with
  const user = await UserService.create({ ...mockUser, ...userProps });

  // ...then sign in
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('todos', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });
  it('POST /api/v1/todos creates a new todo with the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const newItem = { task_name: 'Getr done', completed: false };
    const resp = await agent.post('/api/v1/todos').send(newItem);
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual({
      id: expect.any(String),
      task_name: newItem.task_name,
      completed: false,
      user_id: user.id,
    });
  });

  it('GET /api/v1/todos returns all todos associated with the authenticated User', async () => {
    // create a user
    const [agent, user] = await registerAndLogin();
    // add a second user with items
    const user2 = await UserService.create(mockUser2);
    const user1Item = await Todo.insert({
      task_name: 'the task',
      completed: false,
      user_id: user.id,
    });
    await Todo.insert({
      task_name: 'not the task',
      completed: false,
      user_id: user2.id,
    });
    const resp = await agent.get('/api/v1/todos');
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual([user1Item]);
    
  });

  it('GET /api/v1/todos should return a 401 if not authenticated', async () => {
    const resp = await request(app).get('/api/v1/todos');
    expect(resp.status).toEqual(401);
  });

  it('UPDATE /api/v1/todos/:id should update a todo', async () => {
    // create a user
    const [agent, user] = await registerAndLogin();
    const item = await Todo.insert({
      task_name: 'the task',
      completed: false,
      user_id: user.id,
    });
    const resp = await agent
      .put(`/api/v1/todos/${item.id}`)
      .send({ completed: true });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({ ...item, completed: true });
  });

  it('UPDATE /api/v1/items/:id should 403 for invalid users', async () => {
    // create a user
    const [agent] = await registerAndLogin();
    // create a second user
    const user2 = await UserService.create(mockUser2);
    const item = await Todo.insert({
      task_name: 'not the task',
      completed: false,
      user_id: user2.id,
    });
    const resp = await agent
      .put(`/api/v1/todos/${item.id}`)
      .send({ bought: true });
    expect(resp.status).toBe(403);
  });

  it('DELETE /api/v1/todos/:id should delete todos for valid user', async () => {
    const [agent, user] = await registerAndLogin();
    const item = await Todo.insert({
      task_name: 'the task',
      completed: false,
      user_id: user.id,
    });
    const resp = await agent.delete(`/api/v1/todos/${item.id}`);
    expect(resp.status).toBe(200);

    const check = await Todo.getById(item.id);
    expect(check).toBeNull();
  });
});
