import { Product } from "../../models/product.model";
import { CreateProductInput, UpdateProductInput } from "./product.schema";
import { getNextSequenceValue } from "../../models/counter.model";
import { escapeRegex } from "../../utils/regex.util";

export const createProduct = async (
  input: CreateProductInput,
  createdById: string,
  businessId: string,
) => {
  const isProduct = await Product.findOne({
    businessId,
    productName: input.productName,
  });
  if (isProduct) throw new Error("Product already exists");

  const count = await getNextSequenceValue("Product");
  const productId = `Z_PRO_${count}`;

  const product = await Product.create({
    _id: productId,
    ...input,
    businessId,
    createdBy: createdById,
  });
  return product;
};
export const getProducts = async (
  businessId: string,
  page: number,
  limit: number,
  search?: string,
  categoryId?: string,
) => {
  const query: any = { businessId };
  if (categoryId) {
    query.categoryIds = categoryId;
  }
  if (search) {
    query.productName = { $regex: escapeRegex(search), $options: "i" };
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { products, total };
};
export const getProductById = async (id: string, businessId: string) => {
  const product = await Product.findOne({ _id: id, businessId });
  if (!product) throw new Error("Product not found");
  return product;
};
export const updateProduct = async (
  id: string,
  body: UpdateProductInput,
  businessId: string,
) => {
  const product = await Product.findOneAndUpdate({ _id: id, businessId }, body, {
    new: true,
  });
  if (!product) throw new Error("Product not found");
  return product;
};
export const deleteProduct = async (id: string, businessId: string) => {
  const product = await Product.findOneAndDelete({ _id: id, businessId });
  if (!product) throw new Error("Product not found");
  return product;
};
