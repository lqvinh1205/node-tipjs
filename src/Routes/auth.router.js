const express = require("express");
const route = express.Router();
const authController = require("../Controllers/auth.controller");
const validate = require("../Middlewares/validate");
const authValidation = require("../Validations/users.validation");

route.post(
  "/register",
  validate(authValidation.userCreate),
  authController.register
);

route.post("/login", validate(authValidation.login), authController.login);

route.post("/refresh-token", authController.refreshToken);

route.delete("/logout", authController.logout);

module.exports = route;
