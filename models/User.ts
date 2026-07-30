import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { UserRole } from "@/constants";

const locationSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: undefined },
    city: String,
    area: String,
    state: String,
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    phone: { type: String, trim: true, sparse: true, unique: true },
    passwordHash: { type: String },
    image: String,
    bio: { type: String, maxlength: 1000 },
    location: locationSchema,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    rating: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    emailVerifiedAt: Date,
    phoneVerifiedAt: Date,
    googleId: { type: String, sparse: true, unique: true },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });
userSchema.index({ role: 1 });
userSchema.index({ name: "text" });

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  role: UserRole;
};

export const UserModel: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", userSchema);
