const express = require("express");
const route = express.Router();
const userController = require("../Controllers/user.controller");
const validate = require("../Middlewares/validate");
const userValidate = require("../Validations/users.validation");

route.get("/", userController.getListUser);
route.post("/", validate(userValidate.userCreate), userController.createUser);
route.get("/:id", userController.findUserById);
route.patch(
  "/:id",
  validate(userValidate.userUpdate),
  userController.updateUser
);
route.delete("/:id", userController.deleteUser);

module.exports = route;
