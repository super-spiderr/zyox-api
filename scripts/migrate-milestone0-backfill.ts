/**
 * One-off Milestone 0 backfill for pre-existing (single-tenant) dev data.
 *
 * All data created before multi-tenancy implicitly belonged to a single
 * business. This script:
 *   1. Creates one Business document (idempotent - reuses one if it exists).
 *   2. Assigns that businessId to the existing admin user(s) that lack one.
 *   3. Backfills businessId on Customer/Order/Product/Package/Category docs
 *      that don't have one yet.
 *   4. Migrates legacy Order fields (eventDate/eventName/guestCount) to the
 *      universal shape (deliveryDate/attributes).
 *
 * Safe to re-run: every step only touches documents missing the new fields.
 *
 * Usage: npx tsx scripts/migrate-milestone0-backfill.ts
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../src/config/database";
import { Business } from "../src/models/business.model";
import { User } from "../src/models/user.model";
import { DEFAULT_VERTICAL_TYPE } from "../src/constants/business.constant";

const BACKFILL_COLLECTIONS = [
  "z_customers",
  "z_orders",
  "z_products",
  "z_packages",
  "z_categories",
] as const;

const run = async () => {
  await connectDB();
  const db = mongoose.connection.db!;

  const usersWithoutBusiness = await User.find({ businessId: { $exists: false } });
  if (usersWithoutBusiness.length === 0) {
    console.log("No users missing businessId - nothing to backfill.");
    await mongoose.disconnect();
    return;
  }

  // One legacy business for all pre-existing single-tenant data.
  let business = await Business.findOne({ name: "Legacy Business" });
  if (!business) {
    const owner = usersWithoutBusiness.find((u) => u.role === "ADMIN") ?? usersWithoutBusiness[0];
    business = await Business.create({
      name: "Legacy Business",
      verticalType: DEFAULT_VERTICAL_TYPE,
      language: "en",
      ownerId: owner._id,
    });
    console.log(`Created business ${business._id} ("${business.name}")`);
  } else {
    console.log(`Reusing existing business ${business._id}`);
  }

  const userResult = await User.updateMany(
    { businessId: { $exists: false } },
    { $set: { businessId: business._id } },
  );
  console.log(`Backfilled businessId on ${userResult.modifiedCount} user(s)`);

  for (const collection of BACKFILL_COLLECTIONS) {
    const result = await db
      .collection(collection)
      .updateMany({ businessId: { $exists: false } }, { $set: { businessId: business._id } });
    console.log(`Backfilled businessId on ${result.modifiedCount} doc(s) in ${collection}`);
  }

  // Migrate legacy order shape: eventDate (string) -> deliveryDate (Date);
  // eventName/guestCount -> attributes.{eventName,guestCount}.
  const legacyOrders = await db
    .collection("z_orders")
    .find({ eventDate: { $exists: true } })
    .toArray();

  for (const order of legacyOrders) {
    const attributes: Record<string, unknown> = { ...(order.attributes ?? {}) };
    if (order.eventName !== undefined) attributes.eventName = order.eventName;
    if (order.guestCount !== undefined) attributes.guestCount = order.guestCount;

    await db.collection("z_orders").updateOne(
      { _id: order._id },
      {
        $set: {
          deliveryDate: new Date(order.eventDate),
          attributes,
        },
        $unset: { eventDate: "", eventName: "", guestCount: "" },
      },
    );
  }
  console.log(`Migrated ${legacyOrders.length} legacy order doc(s) to the universal shape`);

  await mongoose.disconnect();
  console.log("Done.");
};

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
