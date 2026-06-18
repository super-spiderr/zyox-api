import { CreateCustomerInput, UpdateCustomerInput } from "./customer.schema";
import { Customer } from "../../models/customer.model";

export const createCustomer = async (
  input: CreateCustomerInput,
  userId: string,
) => {
  const existingCustomer = await Customer.findOne({
    phoneNumber: input.phoneNumber,
  });

  if (existingCustomer) {
    throw new Error("Customer already exists");
  }

  const customer = await Customer.create({
    ...input,
    createdBy: userId,
  });

  return customer;
};

export const getCustomers = async () => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  return customers;
};

export const getCustomersById = async (customerId: string) => {
  const customers = await Customer.findById(customerId);
  if (!customers) throw new Error("Customer not found");
  return customers;
};

export const deleteCustomer = async (customerId: string) => {
  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { isActive: false },
    { new: true }
  );
  if (!customer) throw new Error("Customer not found");
  return customer;
};

export const updateCustomer = async (
  customerId: string,
  input: UpdateCustomerInput,
) => {
  const customer = await Customer.findByIdAndUpdate(customerId, input, {
    new: true,
  });
  if (!customer) throw new Error("Customer not found");
  return customer;
};

