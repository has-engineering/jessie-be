const User = require("../models/user");

const getUsers = (req, res) => {
  const users = User.find();
  return res.status(200).json(users);
};

const getUserById = (req, res) => {
  const { _id } = req.params;
  const user = User.findOne({ _id });
  return res.status(200).json(user);
};

module.exports = {
  getUsers,
  getUserById
};
