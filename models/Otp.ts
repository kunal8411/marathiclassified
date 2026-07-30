import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const otpSchema = new Schema(
  {
    channel: { type: String, enum: ["email", "phone"], required: true },
    destination: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["register", "login", "verify"],
      required: true,
    },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    consumedAt: Date,
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ destination: 1, purpose: 1, consumedAt: 1 });

export type OtpDocument = InferSchemaType<typeof otpSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OtpModel: Model<OtpDocument> =
  mongoose.models.Otp ?? mongoose.model<OtpDocument>("Otp", otpSchema);
