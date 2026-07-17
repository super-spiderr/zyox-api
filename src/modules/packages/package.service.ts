import { Package } from "../../models/package.model";
import { CreatePackageInput, UpdatePackageInput } from "./package.schema";
import { getNextSequenceValue } from "../../models/counter.model";
import { escapeRegex } from "../../utils/regex.util";

export const createPackage = async (
  input: CreatePackageInput,
  createdById: string,
  businessId: string,
) => {
  const isPackage = await Package.findOne({ businessId, name: input.name });
  if (isPackage) throw new Error("Package already exists");

  const count = await getNextSequenceValue("Package");
  const packageId = `Z_PKG_${count}`;

  const newPackage = await Package.create({
    _id: packageId,
    ...input,
    businessId,
    createdBy: createdById,
  });
  return newPackage;
};

export const getPackages = async (
  businessId: string,
  page: number,
  limit: number,
  search?: string,
) => {
  const query: any = { businessId };
  if (search) {
    query.name = { $regex: escapeRegex(search), $options: "i" };
  }

  const total = await Package.countDocuments(query);
  const packages = await Package.find(query)
    .populate("items.itemId")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { packages, total };
};

export const getPackageById = async (id: string, businessId: string) => {
  const pkg = await Package.findOne({ _id: id, businessId }).populate("items.itemId");
  if (!pkg) throw new Error("Package not found");
  return pkg;
};

export const updatePackage = async (
  id: string,
  input: UpdatePackageInput,
  businessId: string,
) => {
  const pkg = await Package.findOneAndUpdate({ _id: id, businessId }, input, {
    new: true,
  }).populate("items.itemId");
  if (!pkg) throw new Error("Package not found");
  return pkg;
};

export const deletePackage = async (id: string, businessId: string) => {
  const pkg = await Package.findOneAndUpdate(
    { _id: id, businessId },
    { isActive: false },
    { new: true }
  ).populate("items.itemId");
  if (!pkg) throw new Error("Package not found");
  return pkg;
};
