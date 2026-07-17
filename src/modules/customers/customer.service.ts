import { CreateCustomerInput, UpdateCustomerInput } from "./customer.schema";
import { Customer } from "../../models/customer.model";
import { escapeRegex } from "../../utils/regex.util";

export const createCustomer = async (
  input: CreateCustomerInput,
  userId: string,
  businessId: string,
) => {
  const existingCustomer = await Customer.findOne({
    businessId,
    phoneNumber: input.phoneNumber,
  });

  if (existingCustomer) {
    throw new Error("Customer already exists");
  }

  const customer = await Customer.create({
    ...input,
    businessId,
    createdBy: userId,
  });

  return customer;
};

export const getCustomers = async (
  businessId: string,
  page: number,
  limit: number,
  search?: string,
) => {
  const query: any = { businessId };
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { customerName: { $regex: safeSearch, $options: "i" } },
      { phoneNumber: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const total = await Customer.countDocuments(query);
  const customers = await Customer.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { customers, total };
};

export const getCustomersById = async (customerId: string, businessId: string) => {
  const customers = await Customer.findOne({ _id: customerId, businessId });
  if (!customers) throw new Error("Customer not found");
  return customers;
};

export const deleteCustomer = async (customerId: string, businessId: string) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, businessId },
    { isActive: false },
    { new: true }
  );
  if (!customer) throw new Error("Customer not found");
  return customer;
};

export const updateCustomer = async (
  customerId: string,
  input: UpdateCustomerInput,
  businessId: string,
) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, businessId },
    input,
    { new: true },
  );
  if (!customer) throw new Error("Customer not found");
  return customer;
};
