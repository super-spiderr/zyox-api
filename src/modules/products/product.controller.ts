import { FastifyReply, FastifyRequest } from "fastify";
import { createProductSchema, updateProductSchema } from "./product.schema";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "./product.service";

export const createProductController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const body = createProductSchema.parse(request.body);
    const product = await createProduct(body, request.user?.userId as string);
    return reply.status(201).send({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getProductController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { categoryId, page, limit, search } = request.query as {
      categoryId?: string;
      page: number;
      limit: number;
      search?: string;
    };
    const { products, total } = await getProducts(page, limit, search, categoryId);
    return reply.status(200).send({
      success: true,
      message: "Products fetched successfully",
      data: products,
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

export const getProductByIdController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const product = await getProductById(id);
    return reply.status(200).send({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const updateProductController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const body = updateProductSchema.parse(request.body);
    const product = await updateProduct(id, body);
    return reply.status(200).send({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const deleteProductController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const product = await deleteProduct(id);
    return reply.status(200).send({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
