import { Customer } from "../../models/customer.model";
import { Product } from "../../models/product.model";
import { Package } from "../../models/package.model";
import { Category } from "../../models/category.model";
import { Order } from "../../models/order.model";
import { OrderStatus } from "../../constants/order.constant";
import { DashboardQueryInput } from "./dashboard.schema";

export const getDashboardStats = async (queryInput: DashboardQueryInput) => {
  const { startDate, endDate } = queryInput;

  // 1. Fetch total counts for entities (active ones)
  const [
    totalCustomersCount,
    totalProductsCount,
    totalPackagesCount,
    totalCategoriesCount,
  ] = await Promise.all([
    Customer.countDocuments({ isActive: { $ne: false } }),
    Product.countDocuments({ isActive: { $ne: false } }),
    Package.countDocuments({ isActive: { $ne: false } }),
    Category.countDocuments({ isActive: { $ne: false } }),
  ]);

  // 2. Build order query based on optional dates
  const orderQuery: any = {};
  if (startDate || endDate) {
    orderQuery.createdAt = {};
    if (startDate) {
      orderQuery.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      orderQuery.createdAt.$lte = end;
    }
  }

  // 3. Retrieve all orders within the date range to calculate metrics in memory
  const orders = await Order.find(orderQuery).select(
    "totalAmount advanceAmount balanceAmount orderStatus paymentStatus createdAt"
  );

  let totalRevenue = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let totalOrdersCount = 0;

  const orderStatusDistribution: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  const paymentStatusDistribution: Record<string, number> = {
    PENDING: 0,
    PARTIAL: 0,
    PAID: 0,
    FAILED: 0,
  };

  const revenueTrendMap = new Map<string, { revenue: number; ordersCount: number }>();

  for (const order of orders) {
    totalOrdersCount++;

    const status = order.orderStatus;
    if (status in orderStatusDistribution) {
      orderStatusDistribution[status]++;
    }

    // Cancelled orders do not contribute to financial metrics or payment status metrics
    if (status === OrderStatus.CANCELLED) {
      continue;
    }

    const payStatus = order.paymentStatus;
    if (payStatus in paymentStatusDistribution) {
      paymentStatusDistribution[payStatus]++;
    }

    totalRevenue += order.totalAmount || 0;
    totalCollected += order.advanceAmount || 0;
    totalPending += order.balanceAmount || 0;

    // Group revenue trend by day (YYYY-MM-DD)
    const dateKey = order.createdAt.toISOString().slice(0, 10);
    const trend = revenueTrendMap.get(dateKey) || { revenue: 0, ordersCount: 0 };
    trend.revenue += order.totalAmount || 0;
    trend.ordersCount++;
    revenueTrendMap.set(dateKey, trend);
  }

  // Convert trend map to sorted array
  const revenueTrend = Array.from(revenueTrendMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: Number(data.revenue.toFixed(2)),
      ordersCount: data.ordersCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 4. Retrieve 5 most recent orders with customer details populated
  const recentOrders = await Order.find(orderQuery)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("customerId", "customerName phoneNumber email");

  return {
    overview: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCollected: Number(totalCollected.toFixed(2)),
      totalPending: Number(totalPending.toFixed(2)),
      totalOrdersCount,
      totalCustomersCount,
      totalProductsCount,
      totalPackagesCount,
      totalCategoriesCount,
    },
    orderStatusDistribution,
    paymentStatusDistribution,
    recentOrders,
    revenueTrend,
  };
};
