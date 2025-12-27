const { Router } = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
} = require("../controllers/user.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/me", verifyJWT, getCurrentUser);
userRoutes.put("/profile", verifyJWT, updateUserProfile);

module.exports = userRoutes;
