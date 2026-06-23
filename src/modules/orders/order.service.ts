import { Order } from "../../models/order.model";
import { CreateOrderInput, UpdateOrderInput } from "./order.schema";
import { getNextSequenceValue } from "../../models/counter.model";
import { Customer } from "../../models/customer.model";
import { Product } from "../../models/product.model";
import { Package } from "../../models/package.model";
import { OrderItemType, OrderStatus } from "../../constants/order.constant";
import { calculateOrderTotals } from "./order.helper";

const validateCustomerExists = async (customerId: string) => {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error("Customer not found");
};

const validateOrderItemsExist = async (
  items: Array<{ type: OrderItemType; itemId: string }>,
) => {
  for (const item of items) {
    if (item.type === OrderItemType.PRODUCT) {
      const prod = await Product.findById(item.itemId);
      if (!prod) throw new Error(`Product not found: ${item.itemId}`);
    } else if (item.type === OrderItemType.PACKAGE) {
      const pkg = await Package.findById(item.itemId);
      if (!pkg) throw new Error(`Package not found: ${item.itemId}`);
    }
  }
};

export const createOrder = async (
  input: CreateOrderInput,
  createdById: string,
) => {
  // 1. Verify customer exists
  await validateCustomerExists(input.customerId);

  // 2. Verify all items exist
  await validateOrderItemsExist(input.orderItems);

  // 3. Generate sequential order number
  const currentYear = new Date().getFullYear();
  const count = await getNextSequenceValue(`Order_${currentYear}`);
  const paddedCount = String(count).padStart(4, "0");
  const orderNumber = `ZYX-${currentYear}-${paddedCount}`;

  // 4. Calculate billing totals
  const totals = calculateOrderTotals(
    input.orderItems,
    input.discountAmount || 0,
    input.advanceAmount || 0,
  );

  // 5. Create Order
  const order = await Order.create({
    orderNumber,
    customerId: input.customerId,
    eventName: input.eventName,
    eventDate: input.eventDate,
    guestCount: input.guestCount,
    ...totals,
    paymentStatus: input.paymentStatus,
    orderStatus: input.orderStatus,
    completedAt: input.completedAt,
    quotationUrl: input.quotationUrl,
    invoiceUrl: input.invoiceUrl,
    notes: input.notes,
    createdBy: createdById,
  });

  return order;
};

export const getOrders = async (
  page: number,
  limit: number,
  search?: string,
) => {
  const query: any = {};
  if (search) {
    // Search by customer name
    const matchingCustomers = await Customer.find({
      customerName: { $regex: search, $options: "i" },
    }).select("_id");
    const customerIds = matchingCustomers.map((c) => c._id);

    query.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { eventName: { $regex: search, $options: "i" } },
      { customerId: { $in: customerIds } },
    ];
  }

  const total = await Order.countDocuments(query);
  const results = await Order.find(query)
    .populate("customerId")
    .populate("orderItems.itemId")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { results, total };
};

export const getOrderById = async (id: string) => {
  const order = await Order.findById(id)
    .populate("customerId")
    .populate("orderItems.itemId");
  if (!order) throw new Error("Order not found");
  return order;
};

export const updateOrder = async (id: string, input: UpdateOrderInput) => {
  const existingOrder = await Order.findById(id);
  if (!existingOrder) throw new Error("Order not found");

  const updateData: any = { ...input };

  // If customer is updated, verify it exists
  if (input.customerId) {
    await validateCustomerExists(input.customerId);
  }

  // If items are updated, verify all exist
  if (input.orderItems) {
    await validateOrderItemsExist(input.orderItems);
  }

  // Re-calculate billing totals if items, discount, or advance amount are updated
  if (
    input.orderItems ||
    input.discountAmount !== undefined ||
    input.advanceAmount !== undefined
  ) {
    const items = input.orderItems || existingOrder.orderItems;
    const discount = input.discountAmount ?? existingOrder.discountAmount;
    const advance = input.advanceAmount ?? existingOrder.advanceAmount;

    const totals = calculateOrderTotals(items, discount, advance);
    Object.assign(updateData, totals);
  }

  const result = await Order.findByIdAndUpdate(id, updateData, { new: true })
    .populate("customerId")
    .populate("orderItems.itemId");
  return result;
};

export const deleteOrder = async (id: string) => {
  const result = await Order.findByIdAndUpdate(
    id,
    { orderStatus: OrderStatus.CANCELLED },
    { new: true },
  )
    .populate("customerId")
    .populate("orderItems.itemId");
  if (!result) throw new Error("Order not found");
  return result;
};
