const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeTodo = require('../middleware/authorizeTodo');
const Todo = require('../models/Todo');

module.exports = Router()
  .post('/', authenticate, async (req, res, next) => {
    try {
      const todo = await Todo.insert({ ...req.body, user_id: req.user.id });
      res.json(todo);
    } catch (e) {
      next(e);
    }
  })
  .get('/', authenticate, async (req, res, next) => {
    try {
      const userID = req.user.id;
      const todo = await Todo.getAll(userID);
      res.json(todo);
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', authenticate, authorizeTodo, async (req, res, next) => {
    try {
      const item = await Todo.updateById(req.params.id, req.body);
      res.json(item);
    } catch (e) {
      next(e);
    }
  });
