const createHttpError = require("http-errors");
const Users = require("../Models/Users.model");
const bcrypt = require("bcrypt");

const findUserById = async (id) => {
  return await Users.findById(id);
};

const getListUserByConditions = async (conditions) => {
  return await Users.find(conditions);
};

const findUserByConditions = async (conditions, options = {}) => {
  return await Users.findOne(conditions, options);
};

const createUser = async (data) => {
  const user = await findUserByConditions({ email: data.email });
  if (user) {
    throw createHttpError(404, "Email already taken");
  }
  data.password = await bcrypt.hash(data.password, 8);
  return await Users.create(data);
};

const updateUser = async (id, data) => {
  return await Users.findByIdAndUpdate(id, data, { new: true });
};

const deleteUser = async (id) => {
  return await Users.findByIdAndDelete(id);
};

module.exports = {
  createUser,
  getListUserByConditions,
  findUserByConditions,
  findUserById,
  updateUser,
  deleteUser,
};
