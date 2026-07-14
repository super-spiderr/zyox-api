import { FastifyReply, FastifyRequest } from "fastify";
import { createCustomerSchema, updateCustomerSchema } from "./customer.schema";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  getCustomersById,
  updateCustomer,
} from "./customer.service";

export const createCustomerController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const body = createCustomerSchema.parse(request.body);
    const customer = await createCustomer(body, request.user!.userId);
    return reply.status(201).send({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getCustomersController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id, page, limit, search } = request.query as {
      id?: string;
      page: number;
      limit: number;
      search?: string;
    };

    if (id) {
      const customer = await getCustomersById(id);
      return reply.status(200).send({
        success: true,
        data: customer,
      });
    }

    const { customers, total } = await getCustomers(page, limit, search);
    return reply.status(200).send({
      success: true,
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getCustomerByIdController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const customer = await getCustomersById(id);

    return reply.status(200).send({
      success: true,
      data: customer,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
export const updateCustomerController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const body = updateCustomerSchema.parse(request.body);
    const customer = await updateCustomer(id, body);
    return reply.status(200).send({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
export const deleteCustomerController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const customer = await deleteCustomer(id);
    return reply.status(200).send({
      success: true,
      message: "Customer deleted successfully",
      data: customer,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
