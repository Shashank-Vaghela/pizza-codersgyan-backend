const mongoose = require("mongoose");
const { mongoURI, mongoDBName } = require("./appConfig");

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      dbName: mongoDBName,
    });
    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

module.exports = connectDB;
