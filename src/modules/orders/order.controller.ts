import { FastifyReply, FastifyRequest } from "fastify";
import { createOrderSchema, updateOrderSchema } from "./order.schema";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
} from "./order.service";

export const createOrderController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = createOrderSchema.parse(request.body);
    const result = await createOrder(body, request.user!.userId);
    return reply.status(201).send({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getOrdersController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { page, limit, search } = request.query as {
      page: number;
      limit: number;
      search?: string;
    };
    const { results, total } = await getOrders(page, limit, search);
    return reply.status(200).send({
      success: true,
      message: "Orders fetched successfully",
      data: results,
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

export const getOrderByIdController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const result = await getOrderById(id);
    return reply.status(200).send({
      success: true,
      message: "Order fetched successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const updateOrderController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const body = updateOrderSchema.parse(request.body);
    const result = await updateOrder(id, body);
    return reply.status(200).send({
      success: true,
      message: "Order updated successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const deleteOrderController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const result = await deleteOrder(id);
    return reply.status(200).send({
      success: true,
      message: "Order deleted successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
