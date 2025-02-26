const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const encrypt = (data, expiresIn = "3d") => {
  return jwt.sign(data, secret, { expiresIn: expiresIn });
};

const decrypt = async (token) => {
  return jwt.verify(token, secret);
};

const jwtService = {
  encrypt,
  decrypt,
};

module.exports = jwtService;
