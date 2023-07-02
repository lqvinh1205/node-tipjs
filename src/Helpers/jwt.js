const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const client = require("../redis");

const generateToken = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: 5 * 60 * 1000,
  });
  const refreshToken = jwt.sign(payload, process.env.SECRET_REFRESH_KEY, {
    expiresIn: 100 * 60 * 1000,
  });
  return {
    token,
    refreshToken,
  };
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY);
};

const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, process.env.SECRET_REFRESH_KEY);
  const refToken = client.get(payload._id.toString());
  if (token != refToken) {
    throw createHttpError.Unauthorized();
  }
  return payload;
};

const refreshToken = (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw createHttpError.BadRequest();
  }
  const infomation = {
    _id: payload.id,
    email: payload.email,
    username: payload.username,
  };
  return generateToken(infomation);
};

module.exports = {
  generateToken,
  verifyToken,
  verifyRefreshToken,
  refreshToken,
};
