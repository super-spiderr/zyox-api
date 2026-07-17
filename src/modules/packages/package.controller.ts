import { FastifyReply, FastifyRequest } from "fastify";
import { createPackageSchema, updatePackageSchema } from "./package.schema";
import {
  createPackage,
  deletePackage,
  getPackageById,
  getPackages,
  updatePackage,
} from "./package.service";

export const createPackageController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = createPackageSchema.parse(request.body);
    const newPackage = await createPackage(
      body,
      request.user!.userId,
      request.user!.businessId,
    );
    return reply.status(201).send({
      success: true,
      message: "Package created successfully",
      data: newPackage,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getPackagesController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { page, limit, search } = request.query as {
      page: number;
      limit: number;
      search?: string;
    };
    const { packages, total } = await getPackages(
      request.user!.businessId,
      page,
      limit,
      search,
    );
    return reply.status(200).send({
      success: true,
      message: "Packages fetched successfully",
      data: packages,
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

export const getPackageByIdController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const pkg = await getPackageById(id, request.user!.businessId);
    return reply.status(200).send({
      success: true,
      message: "Package fetched successfully",
      data: pkg,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const updatePackageController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const body = updatePackageSchema.parse(request.body);
    const pkg = await updatePackage(id, body, request.user!.businessId);
    return reply.status(200).send({
      success: true,
      message: "Package updated successfully",
      data: pkg,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const deletePackageController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const pkg = await deletePackage(id, request.user!.businessId);
    return reply.status(200).send({
      success: true,
      message: "Package deleted successfully",
      data: pkg,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
