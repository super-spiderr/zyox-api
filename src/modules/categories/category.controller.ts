import { FastifyReply, FastifyRequest } from "fastify";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./category.service";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

export const createCategoryController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const body = createCategorySchema.parse(request.body);
    const category = await createCategory(body);
    return reply.status(201).send({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getCategoryController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { page, limit, search } = request.query as {
      page: number;
      limit: number;
      search?: string;
    };
    const { categories, total } = await getCategories(page, limit, search);
    return reply.status(200).send({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
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

export const updateCategoryController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const body = updateCategorySchema.parse(request.body);
    const category = await updateCategory(id, body);
    return reply.status(200).send({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const deleteCategoryController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params as { id: string };
    const category = await deleteCategory(id);
    return reply.status(200).send({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
