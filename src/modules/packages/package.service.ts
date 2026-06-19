import { Package } from "../../models/package.model";
import { CreatePackageInput, UpdatePackageInput } from "./package.schema";
import { getNextSequenceValue } from "../../models/counter.model";

export const createPackage = async (
  input: CreatePackageInput,
  createdById: string
) => {
  const isPackage = await Package.findOne({ name: input.name });
  if (isPackage) throw new Error("Package already exists");

  const count = await getNextSequenceValue("Package");
  const packageId = `Z_PKG_${count}`;

  const newPackage = await Package.create({
    _id: packageId,
    ...input,
    createdBy: createdById,
  });
  return newPackage;
};

export const getPackages = async (
  page: number,
  limit: number,
  search?: string,
) => {
  const query: any = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const total = await Package.countDocuments(query);
  const packages = await Package.find(query)
    .populate("items.itemId")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { packages, total };
};

export const getPackageById = async (id: string) => {
  const pkg = await Package.findById(id).populate("items.itemId");
  if (!pkg) throw new Error("Package not found");
  return pkg;
};

export const updatePackage = async (id: string, input: UpdatePackageInput) => {
  const pkg = await Package.findByIdAndUpdate(id, input, {
    new: true,
  }).populate("items.itemId");
  if (!pkg) throw new Error("Package not found");
  return pkg;
};

export const deletePackage = async (id: string) => {
  const pkg = await Package.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).populate("items.itemId");
  if (!pkg) throw new Error("Package not found");
  return pkg;
};
