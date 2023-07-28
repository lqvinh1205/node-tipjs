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

const verifyRefreshToken = async (token) => {
  try {
    const payload = jwt.verify(token, process.env.SECRET_REFRESH_KEY);
    if (!payload) {
      throw createHttpError.Unauthorized();
    }
    await client.connect();
    const refToken = await client.get(payload._id.toString());
    await client.disconnect();
    if (token != refToken) {
      throw createHttpError.Unauthorized();
    }
    return payload;
  } catch (error) {
    await client.disconnect();
    throw createHttpError.BadRequest(error);
  }
};

const refreshToken = (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(403, "Refesh token not empty");
  }
  const payload = verifyRefreshToken(refreshToken);
  console.log(payload);
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
