exports.ResponseEnhancer = (req, res, next) => {
  res.success = (statusCode = 200, data = [], message = "Success") => {
    return res.status(statusCode).json({
      statusCode,
      data,
      message,
      success: true,
    });
  };
  res.error = (statusCode = 500, message = "Error", data = []) => {
    return res.status(statusCode).json({
      statusCode,
      data,
      message,
      success: false,
    });
  };
  next();
};
