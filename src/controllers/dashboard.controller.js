const dashboardService = require("../services/dashboard.service");
const { asyncHandler } = require("../utils/asyncHandler");

exports.getDashboardData = asyncHandler(async (req, res) => {
  const result = await dashboardService.getDashboardData();
  
  if (!result.success) {
    return res.error(result.statusCode, result.message);
  }
  
  return res.success(200, result.data, "Dashboard data fetched successfully");
});
