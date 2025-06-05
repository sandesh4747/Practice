// Importing necessary models
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Controller function to get overall analytics and daily sales data
export const getAnalytics = async (req, res) => {
  try {
    // Get general analytics data like total users, products, sales, revenue
    const analyticsData = await getAnalyticsData();

    // Calculate the date range: past 7 days including today
    const endDate = new Date(); // today
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Get sales data for each day in the range
    const dailySalesData = await getDailySalesData(startDate, endDate);

    // Send both datasets in response
    res.status(200).json({ analyticsData, dailySalesData });
  } catch (error) {
    console.log("Error in getAnalytics controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to get total users, products, sales, and revenue
export const getAnalyticsData = async () => {
  // Count total users in the database
  const totalUsers = await User.countDocuments();

  // Count total products in the database
  const totalProducts = await Product.countDocuments();

  // Aggregate sales data from orders
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 }, // Count number of orders
        totalRevenue: { $sum: "$totalAmount" }, // Sum of totalAmount in all orders
      },
    },
  ]);

  // Destructure results or set defaults if no data
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  // Return the final analytics object
  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

// Helper function to get daily sales and revenue data for a date range
export const getDailySalesData = async (startDate, endDate) => {
  try {
    // Aggregate daily sales from orders between startDate and endDate
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }, // Filter by date
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
          totalSales: { $sum: 1 }, // Count of orders per day
          totalRevenue: { $sum: "$totalAmount" }, // Sum of revenue per day
        },
      },
      {
        $sort: { _id: 1 }, // Sort dates in ascending order
      },
    ]);

    // Example of dailySalesData format:
    /*
     [
       { _id: '2023-06-01', totalSales: 1, totalRevenue: 100 },
       { _id: '2023-06-02', totalSales: 2, totalRevenue: 200 },
     ]
    */

    // Generate all dates between start and end as array of strings
    const dateArray = getDatesInRange(startDate, endDate);
    // Example: ['2025-05-25', '2025-05-26', ...]

    // Map each date to either the existing sales data or default values
    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.totalSales || 0, // Use actual or fallback to 0
        revenue: foundData?.totalRevenue || 0, // Use actual or fallback to 0
      };
    });
  } catch (error) {
    throw error;
  }
};

// Utility function to generate all dates between startDate and endDate
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Format to 'YYYY-MM-DD' and push to array
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1); // Move to next day
  }
  return dates;
}
