require("dotenv").config();

const appConfig = {
  port: process.env.PORT || 5001,
  mongoURI: process.env.MONGO_URI,
  mongoDBName: process.env.MONGO_DB,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  tokenExpire: "30d",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
};

module.exports = appConfig;
