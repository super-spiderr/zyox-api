import { Product } from "../../models/product.model";
import { CreateProductInput, UpdateProductInput } from "./product.schema";
import { getNextSequenceValue } from "../../models/counter.model";

export const createProduct = async (
  input: CreateProductInput,
  createdById: string,
) => {
  const isProduct = await Product.findOne({ productName: input.productName });
  if (isProduct) throw new Error("Product already exists");

  const count = await getNextSequenceValue("Product");
  const productId = `Z_PRO_${count}`;

  const product = await Product.create({
    _id: productId,
    ...input,
    createdBy: createdById,
  });
  return product;
};
export const getProducts = async (
  page: number,
  limit: number,
  search?: string,
  categoryId?: string,
) => {
  const query: any = {};
  if (categoryId) {
    query.categoryIds = categoryId;
  }
  if (search) {
    query.productName = { $regex: search, $options: "i" };
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { products, total };
};
export const getProductById = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");
  return product;
};
export const updateProduct = async (id: string, body: UpdateProductInput) => {
  const product = await Product.findByIdAndUpdate(id, body, { new: true });
  if (!product) throw new Error("Product not found");
  return product;
};
export const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new Error("Product not found");
  return product;
};
