const jwt = require("jsonwebtoken");
const { jwtSecret, tokenExpire } = require("../config/appConfig");

module.exports.generateToken = (user) => {
  const payload = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: tokenExpire });

  return accessToken;
};

module.exports.decodeToken = async (token) => {
  return jwt.verify(token, jwtSecret);
};
