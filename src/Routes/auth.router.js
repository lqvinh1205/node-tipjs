const express = require("express");
const Users = require("../Models/Users.model");
const bcrypt = require("bcrypt");
const route = express.Router();
const createHttpError = require("http-errors");
const client = require("../redis");
const {
  userCreateValidate,
  loginValidate,
} = require("../validations/users.validation");
const {
  generateToken,
  refreshToken,
  verifyRefreshToken,
} = require("../Helpers/jwt");

route.post("/register", async (req, res, next) => {
  try {
    const { error } = userCreateValidate(req.body);
    if (error) {
      throw createError(422, error.message);
    }

    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (user) {
      throw createError(422, "User already exists");
    }

    req.body.password = await bcrypt.hash(password, 8);
    const response = await Users.create(req.body);
    return res.status(201).json({
      status: 201,
      message: "success",
      data: response,
    });
  } catch (error) {
    next(createHttpError(422, error));
  }
});

route.post("/login", async (req, res, next) => {
  try {
    const { error } = loginValidate(req.body);
    if (error) {
      throw createHttpError(422, error.message);
    }

    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      throw createHttpError(422, "User not exists");
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw createHttpError(401, "Email or password not corect");
    }
    const { token, refreshToken } = generateToken(user);
    // await client.connect();
    // await client.set(
    //   user._id.toString(),
    //   refreshToken,
    //   "EX",
    //   365 * 24 * 60 * 60
    // );

    return res.status(200).json({
      status: 200,
      message: "success",
      token,
      refreshToken,
    });
  } catch (error) {
    next(createHttpError(422, error));
  }
});

route.post("/refresh-token", (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      throw createHttpError(403, "Refesh token not empty");
    }
    const response = refreshToken(token);
    return res.status(201).json(response);
  } catch (error) {
    next(createHttpError(422, error));
  }
});

route.delete("/logout", (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createHttpError.BadRequest();
    }
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw createHttpError.Unauthorized();
    }
    client.del(payload._id.toString());
  } catch (error) {
    next(createHttpError.BadRequest());
  }
});

module.exports = route;
