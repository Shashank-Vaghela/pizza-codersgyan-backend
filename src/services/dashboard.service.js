const Order = require("../models/order.model");
const { serviceHandler } = require("../utils/asyncHandler");

// Get dashboard data (combines stats, recent orders, and sales data)
exports.getDashboardData = serviceHandler(async () => {
  // Get order stats
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$pricing.total" },
      },
    },
  ]);

  // Get recent 6 orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .populate("user", "firstName lastName email")
    .populate("items.product");

  // Get sales data for last 7 days
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo, $lte: today },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        sales: { $sum: "$pricing.total" },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Create array with all 7 days (fill missing days with 0)
  const salesChartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    
    const dayData = salesData.find((d) => d._id === dateStr);
    
    salesChartData.push({
      date: dateStr,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      sales: dayData?.sales || 0,
      orders: dayData?.orders || 0,
    });
  }

  const dashboardData = {
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    recentOrders,
    salesData: salesChartData,
  };

  return { success: true, statusCode: 200, data: dashboardData };
});
