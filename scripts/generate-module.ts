import fs from "node:fs";
import path from "node:path";

// Helper to convert string to kebab-case (e.g. productCategories -> product-categories)
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/[\s_-]+/g, "-")
    .toLowerCase();
}

// Helper to singularize a word
function singularize(str: string): string {
  const lower = str.toLowerCase();
  if (lower.endsWith("entries")) {
    return str.slice(0, -7) + "entry";
  }
  if (lower.endsWith("categories")) {
    return str.slice(0, -10) + "category";
  }
  if (lower.endsWith("ies")) {
    return str.slice(0, -3) + "y";
  }
  if (
    lower.endsWith("s") &&
    !lower.endsWith("ss") &&
    !lower.endsWith("us") &&
    !lower.endsWith("is") &&
    !lower.endsWith("as")
  ) {
    return str.slice(0, -1);
  }
  return str;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function main() {
  const rawInput = process.argv[2];
  if (!rawInput) {
    console.error("Error: Please provide a module name.");
    console.log("Usage: npm run make:module <module-name>");
    console.log("Example: npm run make:module customers");
    process.exit(1);
  }

  const folderName = toKebabCase(rawInput);
  const singularInput = singularize(rawInput);
  const filePrefix = toKebabCase(singularInput);
  const pascalName = capitalize(singularInput);
  const camelName =
    singularInput.charAt(0).toLowerCase() + singularInput.slice(1);
  const shortPrefix = singularInput.slice(0, 3).toUpperCase();
  const moduleTag = capitalize(rawInput);

  const targetDir = path.resolve(process.cwd(), "src", "modules", folderName);
  const modelDir = path.resolve(process.cwd(), "src", "models");
  const modelFilePath = path.join(modelDir, `${filePrefix}.model.ts`);

  if (fs.existsSync(targetDir)) {
    console.error(
      `Error: Module folder already exists at: src/modules/${folderName}`,
    );
    process.exit(1);
  }

  console.log(`Creating module '${folderName}'...`);
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Generate Schema
  const schemaContent = `import { z } from "zod";

export const create${pascalName}Schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  isActive: z.boolean().optional().default(true),
});

export type Create${pascalName}Input = z.infer<typeof create${pascalName}Schema>;

export const update${pascalName}Schema = create${pascalName}Schema.partial();
export type Update${pascalName}Input = z.infer<typeof update${pascalName}Schema>;
`;
  fs.writeFileSync(
    path.join(targetDir, `${filePrefix}.schema.ts`),
    schemaContent,
    "utf8",
  );
  console.log(`  Created: src/modules/${folderName}/${filePrefix}.schema.ts`);

  // 2. Generate Model
  const modelContent = `import mongoose, { Document, Schema } from "mongoose";

export interface I${pascalName} extends Document<string> {
  _id: string;
  name: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ${pascalName}Schema = new Schema<I${pascalName}>(
  {
    _id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "z_${folderName}",
  }
);

export const ${pascalName} = mongoose.model<I${pascalName}>("${pascalName}", ${pascalName}Schema);
`;
  if (!fs.existsSync(modelFilePath)) {
    fs.writeFileSync(modelFilePath, modelContent, "utf8");
    console.log(`  Created: src/models/${filePrefix}.model.ts`);
  }

  // 3. Generate Service
  const serviceContent = `import { ${pascalName} } from "../../models/${filePrefix}.model";
import { Create${pascalName}Input, Update${pascalName}Input } from "./${filePrefix}.schema";
import { getNextSequenceValue } from "../../models/counter.model";

export const create${pascalName} = async (
  input: Create${pascalName}Input,
  createdById: string
) => {
  const count = await getNextSequenceValue("${pascalName}");
  const id = "Z_${shortPrefix}_" + count;

  const result = await ${pascalName}.create({
    _id: id,
    ...input,
    createdBy: createdById,
  });
  return result;
};

export const get${pascalName}s = async (
  page: number,
  limit: number,
  search?: string
) => {
  const query: any = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const total = await ${pascalName}.countDocuments(query);
  const results = await ${pascalName}.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { results, total };
};

export const get${pascalName}ById = async (id: string) => {
  const result = await ${pascalName}.findById(id);
  if (!result) throw new Error("${pascalName} not found");
  return result;
};

export const update${pascalName} = async (id: string, input: Update${pascalName}Input) => {
  const result = await ${pascalName}.findByIdAndUpdate(id, input, { new: true });
  if (!result) throw new Error("${pascalName} not found");
  return result;
};

export const delete${pascalName} = async (id: string) => {
  const result = await ${pascalName}.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!result) throw new Error("${pascalName} not found");
  return result;
};
`;
  fs.writeFileSync(
    path.join(targetDir, `${filePrefix}.service.ts`),
    serviceContent,
    "utf8",
  );
  console.log(`  Created: src/modules/${folderName}/${filePrefix}.service.ts`);

  // 4. Generate Controller
  const controllerContent = `import { FastifyReply, FastifyRequest } from "fastify";
import { create${pascalName}Schema, update${pascalName}Schema } from "./${filePrefix}.schema";
import {
  create${pascalName},
  delete${pascalName},
  get${pascalName}ById,
  get${pascalName}s,
  update${pascalName},
} from "./${filePrefix}.service";

export const create${pascalName}Controller = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = create${pascalName}Schema.parse(request.body);
    const result = await create${pascalName}(body, request.user!.userId);
    return reply.status(201).send({
      success: true,
      message: "${pascalName} created successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const get${pascalName}sController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { page, limit, search } = request.query as {
      page: number;
      limit: number;
      search?: string;
    };
    const { results, total } = await get${pascalName}s(page, limit, search);
    return reply.status(200).send({
      success: true,
      message: "${pascalName}s fetched successfully",
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

export const get${pascalName}ByIdController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const result = await get${pascalName}ById(id);
    return reply.status(200).send({
      success: true,
      message: "${pascalName} fetched successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const update${pascalName}Controller = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const body = update${pascalName}Schema.parse(request.body);
    const result = await update${pascalName}(id, body);
    return reply.status(200).send({
      success: true,
      message: "${pascalName} updated successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const delete${pascalName}Controller = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };
    const result = await delete${pascalName}(id);
    return reply.status(200).send({
      success: true,
      message: "${pascalName} deleted successfully",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};
`;
  fs.writeFileSync(
    path.join(targetDir, `${filePrefix}.controller.ts`),
    controllerContent,
    "utf8",
  );
  console.log(
    `  Created: src/modules/${folderName}/${filePrefix}.controller.ts`,
  );

  const routeContent = `import { FastifyInstance } from "fastify";
import { z } from "zod";
import { protectedRoute } from "../../middleware/auth.middleware";
import {
  create${pascalName}Controller,
  delete${pascalName}Controller,
  get${pascalName}ByIdController,
  get${pascalName}sController,
  update${pascalName}Controller,
} from "./${filePrefix}.controller";
import { create${pascalName}Schema, update${pascalName}Schema } from "./${filePrefix}.schema";
import { paginationQuerySchema } from "../common/common.schema";

export default async function ${camelName}Routes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["${moduleTag}"],
        security: [{ bearerAuth: [] }],
        body: create${pascalName}Schema,
      },
    },
    create${pascalName}Controller,
  );
  fastify.get(
    "/",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["${moduleTag}"],
        security: [{ bearerAuth: [] }],
        querystring: paginationQuerySchema,
      },
    },
    get${pascalName}sController,
  );
  fastify.get(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["${moduleTag}"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    get${pascalName}ByIdController,
  );
  fastify.put(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["${moduleTag}"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
        body: update${pascalName}Schema,
      },
    },
    update${pascalName}Controller,
  );
  fastify.delete(
    "/:id",
    {
      preHandler: [protectedRoute],
      schema: {
        tags: ["${moduleTag}"],
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
      },
    },
    delete${pascalName}Controller,
  );
}
`;
  fs.writeFileSync(
    path.join(targetDir, `${filePrefix}.route.ts`),
    routeContent,
    "utf8",
  );
  console.log(`  Created: src/modules/${folderName}/${filePrefix}.route.ts`);

  console.log("\nModule creation complete! 🎉\n");
}

main();
