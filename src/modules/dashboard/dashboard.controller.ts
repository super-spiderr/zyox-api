import { FastifyReply, FastifyRequest } from "fastify";
import { dashboardQuerySchema } from "./dashboard.schema";
import { getDashboardStats } from "./dashboard.service";

export const getDashboardController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const query = dashboardQuerySchema.parse(request.query);
    const result = await getDashboardStats(request.user!.businessId, query);
    return reply.status(200).send({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
