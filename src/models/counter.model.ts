import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  modelName: string;
  count: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    modelName: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    collection: "z_counters",
  }
);

export const Counter = mongoose.model<ICounter>("Counter", CounterSchema);

export const getNextSequenceValue = async (modelName: string): Promise<number> => {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { modelName },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.count;
};
