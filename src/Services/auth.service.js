const createHttpError = require("http-errors");
const bcrypt = require("bcrypt");
const userSevice = require("../Services/user.service");
const redis = require("../redis");
const jwt = require("jsonwebtoken");

const loginWithEmailAndPassword = async (email, password) => {
  const user = await userSevice.findUserByConditions(
    { email },
    { email: true, username: true, password: true }
  );
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw createHttpError(401, "Email or password not corect");
  }
  const { token, refreshToken } = generateToken(user);

  await redis.set(user._id.toString(), refreshToken, "EX", 365 * 24 * 60 * 60);

  return {
    token,
    refreshToken,
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(403, "Refesh token not empty");
  }
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    throw createHttpError.Unauthorized();
  }
  redis.del(payload._id.toString());
  return null;
};

const generateToken = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: 5 * 60,
  });
  const refreshToken = jwt.sign(payload, process.env.SECRET_REFRESH_KEY, {
    expiresIn: "1 year",
  });
  return {
    token,
    refreshToken,
  };
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.SECRET_KEY, function (error, decode) {
    if (error) {
      const message =
        error.name == "JsonWebTokenError" ? "Unauthorized" : error.message;
      throw createHttpError.Unauthorized(message);
    }
  });
};

const verifyRefreshToken = async (token) => {
  const payload = jwt.verify(
    token,
    process.env.SECRET_REFRESH_KEY,
    function (error, decode) {
      if (error) {
        const message =
          error.name == "JsonWebTokenError" ? "Unauthorized" : error.message;
        throw createHttpError.Unauthorized(message);
      }
      return decode;
    }
  );
  if (!payload) {
    throw createHttpError.Unauthorized();
  }
  const refToken = await redis.get(payload._id.toString());

  if (token != refToken) {
    throw createHttpError.Unauthorized();
  }

  return payload;
};

const refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(403, "Refesh token not empty");
  }
  const payload = await verifyRefreshToken(refreshToken);
  delete payload.iat;
  delete payload.exp;
  const response = generateToken(payload);
  await redis.set(
    payload._id.toString(),
    response.refreshToken,
    "EX",
    365 * 24 * 60 * 60
  );
  return response;
};

module.exports = {
  logout,
  loginWithEmailAndPassword,
  refreshToken,
  verifyToken,
};
