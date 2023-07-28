const createHttpError = require("http-errors");
const Users = require("../Models/Users.model");
const bcrypt = require("bcrypt");

const getUserById = async (id) => {
  return await Users.findById(id);
};

const getUserByCondition = async (condition) => {
  return await Users.findOne(condition);
};

const createUser = async (data) => {
  const user = await getUserByCondition({ email: data.email });
  if (user) {
    throw createHttpError(404, "Email already taken");
  }
  data.password = await bcrypt.hash(data.password, 8);
  return await Users.create(data);
};

module.exports = {
  createUser,
  getUserByCondition,
};
