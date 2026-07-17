import { Order } from "../../models/order.model";
import { CreateOrderInput, UpdateOrderInput } from "./order.schema";
import { getNextSequenceValue } from "../../models/counter.model";
import { Customer } from "../../models/customer.model";
import { Product } from "../../models/product.model";
import { Package } from "../../models/package.model";
import { Business } from "../../models/business.model";
import { OrderItemType, OrderStatus } from "../../constants/order.constant";
import { CustomerType } from "../../constants/customer.constant";
import { calculateOrderTotals } from "./order.helper";
import { validateOrderAttributes } from "./order.attributes.schema";
import { escapeRegex } from "../../utils/regex.util";

const getBusinessVerticalType = async (businessId: string) => {
  const business = await Business.findById(businessId);
  if (!business) throw new Error("Business not found");
  return business.verticalType;
};

const validateCustomerExists = async (customerId: string, businessId: string) => {
  const customer = await Customer.findOne({ _id: customerId, businessId });
  if (!customer) throw new Error("Customer not found");
  return customer;
};

const resolveCustomerId = async (
  input: Pick<CreateOrderInput, "customerId" | "customerName" | "customerPhone">,
  businessId: string,
  createdById: string,
) => {
  if (input.customerId) {
    const customer = await validateCustomerExists(input.customerId, businessId);
    return customer._id.toString();
  }

  // customerName + customerPhone are required by createOrderSchema's refine
  // when customerId is absent, so both are guaranteed present here.
  const existing = await Customer.findOne({
    businessId,
    phoneNumber: input.customerPhone,
  });
  if (existing) return existing._id.toString();

  const created = await Customer.create({
    businessId,
    customerName: input.customerName,
    phoneNumber: input.customerPhone,
    customerType: CustomerType.INDIVIDUAL,
    isActive: true,
    createdBy: createdById,
  });
  return created._id.toString();
};

const validateOrderItemsExist = async (
  items: Array<{ type: OrderItemType; itemId: string }>,
  businessId: string,
) => {
  for (const item of items) {
    if (item.type === OrderItemType.PRODUCT) {
      const prod = await Product.findOne({ _id: item.itemId, businessId });
      if (!prod) throw new Error(`Product not found: ${item.itemId}`);
    } else if (item.type === OrderItemType.PACKAGE) {
      const pkg = await Package.findOne({ _id: item.itemId, businessId });
      if (!pkg) throw new Error(`Package not found: ${item.itemId}`);
    }
  }
};

export const createOrder = async (
  input: CreateOrderInput,
  createdById: string,
  businessId: string,
) => {
  // 1. Resolve customer (existing by id, existing by phone, or auto-create)
  const customerId = await resolveCustomerId(input, businessId, createdById);

  // 2. Verify all items exist and belong to this business
  await validateOrderItemsExist(input.orderItems, businessId);

  // 3. Validate attributes against the business's vertical schema
  const verticalType = await getBusinessVerticalType(businessId);
  const attributes = validateOrderAttributes(verticalType, input.attributes);

  // 4. Generate sequential order number
  const currentYear = new Date().getFullYear();
  const count = await getNextSequenceValue(`Order_${currentYear}`);
  const paddedCount = String(count).padStart(4, "0");
  const orderNumber = `ZYX-${currentYear}-${paddedCount}`;

  // 5. Calculate billing totals
  const totals = calculateOrderTotals(
    input.orderItems,
    input.discountAmount || 0,
    input.advanceAmount || 0,
  );

  // 6. Create Order
  const order = await Order.create({
    orderNumber,
    businessId,
    customerId,
    deliveryDate: new Date(input.deliveryDate),
    attributes,
    orderSource: input.orderSource,
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
  businessId: string,
  page: number,
  limit: number,
  search?: string,
) => {
  const query: any = { businessId };
  if (search) {
    const safeSearch = escapeRegex(search);
    // Search by customer name
    const matchingCustomers = await Customer.find({
      businessId,
      customerName: { $regex: safeSearch, $options: "i" },
    }).select("_id");
    const customerIds = matchingCustomers.map((c) => c._id);

    query.$or = [
      { orderNumber: { $regex: safeSearch, $options: "i" } },
      { "attributes.eventName": { $regex: safeSearch, $options: "i" } },
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

export const getOrderById = async (id: string, businessId: string) => {
  const order = await Order.findOne({ _id: id, businessId })
    .populate("customerId")
    .populate("orderItems.itemId");
  if (!order) throw new Error("Order not found");
  return order;
};

export const updateOrder = async (
  id: string,
  input: UpdateOrderInput,
  businessId: string,
) => {
  const existingOrder = await Order.findOne({ _id: id, businessId });
  if (!existingOrder) throw new Error("Order not found");

  const updateData: any = { ...input };
  if (input.deliveryDate) {
    updateData.deliveryDate = new Date(input.deliveryDate);
  }

  // If customer is updated, verify it belongs to this business
  if (input.customerId) {
    await validateCustomerExists(input.customerId, businessId);
  }

  // If items are updated, verify all exist and belong to this business
  if (input.orderItems) {
    await validateOrderItemsExist(input.orderItems, businessId);
  }

  // If attributes are updated, validate against the business's vertical schema
  if (input.attributes) {
    const verticalType = await getBusinessVerticalType(businessId);
    updateData.attributes = validateOrderAttributes(verticalType, input.attributes);
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

  const result = await Order.findOneAndUpdate({ _id: id, businessId }, updateData, {
    new: true,
  })
    .populate("customerId")
    .populate("orderItems.itemId");
  return result;
};

export const deleteOrder = async (id: string, businessId: string) => {
  const result = await Order.findOneAndUpdate(
    { _id: id, businessId },
    { orderStatus: OrderStatus.CANCELLED },
    { new: true },
  )
    .populate("customerId")
    .populate("orderItems.itemId");
  if (!result) throw new Error("Order not found");
  return result;
};
