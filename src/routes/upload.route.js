const express = require("express");
const router = express.Router();
const { verifyJWT, checkRole } = require("../middlewares/auth.middleware");
const { asyncHandler } = require("../utils/asyncHandler");
const { uploadImage } = require("../utils/uploadImage");

// Upload image endpoint (admin only)
router.post(
  "/",
  verifyJWT,
  checkRole(["admin"]),
  asyncHandler(async (req, res) => {
    const { image } = req.body;

    if (!image) {
      return res.error(400, "Image data is required");
    }

    try {
      const imageUrl = await uploadImage(image);
      return res.success(200, { url: imageUrl }, "Image uploaded successfully");
    } catch (error) {
      return res.error(500, error.message);
    }
  })
);

module.exports = router;
