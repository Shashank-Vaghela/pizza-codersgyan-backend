const User = require("../models/user.model");
const { decodeToken } = require("../utils/jwt");

module.exports.verifyJWT = async (req, res, next) => {
  try {
    let token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.error(401, "Unauthorized request");
    }

    const decodedUser = await decodeToken(token);

    if (!decodedUser) {
      return res.error(400, "Invalid token payload");
    }

    const user = await User.findOne({ _id: decodedUser._id, status: true });
    if (!user) {
      return res.error(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.error(500, error?.message || "Something went wrong");
  }
};

module.exports.checkRole = (allowedRoles) => async (req, res, next) => {
  try {
    let token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.error(401, "Unauthorized request");
    }

    const decodedUser = await decodeToken(token);

    if (!decodedUser) {
      return res.error(400, "Invalid token payload");
    }

    const user = await User.findOne({ _id: decodedUser._id, status: true });
    if (!user) {
      return res.error(404, "User not found");
    }

    req.user = user;

    // Check if the decoded token role is in the allowedRoles array
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.error(403, "User not authorized to perform this action");
    }
  } catch (err) {
    console.error(err);
    return res.error(500, "Internal server error");
  }
};

module.exports.checkRoleOrSelf = (allowedRoles) => async (req, res, next) => {
  try {
    let token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.error(401, "Unauthorized request");
    }

    const decodedUser = await decodeToken(token);
    if (!decodedUser) {
      return res.error(400, "Invalid token payload");
    }

    const user = await User.findOne({ _id: decodedUser._id, status: true });
    if (!user) {
      return res.error(404, "User not found");
    }

    req.user = user;
    const isAllowedRole = allowedRoles.includes(req.user.role);
    const isOwner = req.params.id === req.user._id.toString();

    if (isAllowedRole || isOwner) {
      return next();
    } else {
      return res.error(403, "User not authorized to perform this action");
    }
  } catch (err) {
    console.error(err);
    return res.error(500, "Internal server error");
  }
};
