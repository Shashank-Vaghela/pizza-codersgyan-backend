const cloudinary = require("cloudinary").v2;
const appConfig = require("../config/appConfig");

// Configure Cloudinary
cloudinary.config({
  cloud_name: appConfig.cloudinary.cloudName,
  api_key: appConfig.cloudinary.apiKey,
  api_secret: appConfig.cloudinary.apiSecret,
});

const uploadImage = async (base64Image, folder = "pizza-products") => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
      ],
    });

    return result.secure_url;
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const deleteImage = async (imageUrl) => {
  try {
    // Extract public_id from URL
    const urlParts = imageUrl.split("/");
    const publicIdWithExtension = urlParts.slice(-2).join("/");
    const publicId = publicIdWithExtension.split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Image deletion failed:", error.message);
    // Don't throw error, just log it
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
