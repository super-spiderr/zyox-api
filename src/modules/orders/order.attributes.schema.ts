import { z } from "zod";
import { VerticalType } from "../../constants/business.constant";

// Per-vertical `attributes` schemas. To onboard a new vertical, add one schema
// here and register it below - no changes needed elsewhere in the order flow.

export const cateringAttributesSchema = z
  .object({
    eventName: z.string().optional(),
    guestCount: z.number().int().min(1).optional(),
  })
  .passthrough();

// Verticals without a dedicated schema yet fall back to accepting any
// key/value attributes, so onboarding isn't blocked on a schema being written.
const defaultAttributesSchema = z.record(z.string(), z.unknown());

const attributesSchemaByVertical: Record<string, z.ZodTypeAny> = {
  [VerticalType.CATERING]: cateringAttributesSchema,
};

export const getAttributesSchema = (verticalType: string): z.ZodTypeAny =>
  attributesSchemaByVertical[verticalType?.toUpperCase()] ?? defaultAttributesSchema;

export const validateOrderAttributes = (
  verticalType: string,
  attributes: unknown,
): Record<string, unknown> => {
  const schema = getAttributesSchema(verticalType);
  const result = schema.safeParse(attributes ?? {});
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "attributes"}: ${issue.message}`)
      .join(", ");
    throw new Error(`Invalid order attributes: ${message}`);
  }
  return result.data as Record<string, unknown>;
};
