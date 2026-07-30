import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const reportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["ad", "user"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, maxlength: 200 },
    details: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true },
);

reportSchema.index({ targetType: 1, targetId: 1 });

export type ReportDocument = InferSchemaType<typeof reportSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ReportModel: Model<ReportDocument> =
  mongoose.models.Report ?? mongoose.model<ReportDocument>("Report", reportSchema);
