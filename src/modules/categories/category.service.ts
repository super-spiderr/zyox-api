import { Category } from "../../models/category.model";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";
import { getNextSequenceValue } from "../../models/counter.model";

export const createCategory = async (input: CreateCategoryInput) => {
  const isCategory = await Category.findOne({
    categoryName: input.categoryName,
  });
  if (isCategory) throw new Error("Category already exists");

  const count = await getNextSequenceValue("Category");
  const categoryId = `Z_CAT_${count}`;

  const category = await Category.create({
    _id: categoryId,
    ...input,
    createdBy: input.createdBy,
  });
  return category;
};
export const getCategories = async (page: number, limit: number, search?: string) => {
  const query: any = {};
  if (search) {
    query.categoryName = { $regex: search, $options: "i" };
  }

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { categories, total };
};
export const getCategoriesById = async (categoryId: string) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new Error("Category not found");
  return category;
};
export const deleteCategory = async (categoryId: string) => {
  const category = await Category.findByIdAndUpdate(
    categoryId,
    { isActive: false },
      { new: true },
  );
  if (!category) throw new Error("Category not found");
  return category;
};
export const updateCategory = async (
  categoryId: string,
  input: UpdateCategoryInput,
) => {
  const category = await Category.findByIdAndUpdate(categoryId, input, {
    new: true,
  });
  if (!category) throw new Error("Category not found");
  return category;
};
