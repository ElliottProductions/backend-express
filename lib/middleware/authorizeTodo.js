const Todo = require('../models/Todo');

module.exports = async (req, res, next) => {
  try {
    const item = await Todo.getById(req.params.id);

    if (!Todo || item.user_id !== req.user.id) {
      throw new Error('Nuh, uh uh, you didnt say the magic word');
    }
    next();
  } catch (e) {
    e.status = 403;
    next(e);
  }
};
