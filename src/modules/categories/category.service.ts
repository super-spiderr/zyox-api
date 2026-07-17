import { Category } from "../../models/category.model";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";
import { getNextSequenceValue } from "../../models/counter.model";
import { escapeRegex } from "../../utils/regex.util";

export const createCategory = async (
  input: CreateCategoryInput,
  createdById: string,
  businessId: string,
) => {
  const isCategory = await Category.findOne({
    businessId,
    categoryName: input.categoryName,
  });
  if (isCategory) throw new Error("Category already exists");

  const count = await getNextSequenceValue("Category");
  const categoryId = `Z_CAT_${count}`;

  const category = await Category.create({
    _id: categoryId,
    ...input,
    businessId,
    createdBy: createdById,
  });
  return category;
};
export const getCategories = async (
  businessId: string,
  page: number,
  limit: number,
  search?: string,
) => {
  const query: any = { businessId };
  if (search) {
    query.categoryName = { $regex: escapeRegex(search), $options: "i" };
  }

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { categories, total };
};
export const getCategoriesById = async (categoryId: string, businessId: string) => {
  const category = await Category.findOne({ _id: categoryId, businessId });
  if (!category) throw new Error("Category not found");
  return category;
};
export const deleteCategory = async (categoryId: string, businessId: string) => {
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, businessId },
    { isActive: false },
    { new: true },
  );
  if (!category) throw new Error("Category not found");
  return category;
};
export const updateCategory = async (
  categoryId: string,
  input: UpdateCategoryInput,
  businessId: string,
) => {
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, businessId },
    input,
    { new: true },
  );
  if (!category) throw new Error("Category not found");
  return category;
};
