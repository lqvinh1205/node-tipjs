const Joi = require("joi");

const userCreateValidate = (input) => {
  const userSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    username: Joi.string().required().trim(),
    password: Joi.string().required().trim().min(6),
    confirmPassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .options({
        messages: { "any.only": "Confirm password not match with password" },
      }),
  });
  return userSchema.validate(input);
};

const loginValidate = (input) => {
  const cretialsSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(6).required(),
  });
  return cretialsSchema.validate(input);
};

module.exports = {
  userCreateValidate,
  loginValidate,
};
