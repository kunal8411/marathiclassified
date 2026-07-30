import mongoose from "mongoose";
import { UserModel, type UserDocument } from "@/models/User";
import { serialize, serializeMany, type Serialized } from "./serialize";

export type SerializedUser = Serialized<UserDocument>;

export type CreateUserInput = {
  name: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  image?: string;
  googleId?: string;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
};

export type UpdateUserInput = Partial<
  Pick<
    UserDocument,
    "name" | "email" | "phone" | "passwordHash" | "image" | "bio" | "location" | "lastActiveAt"
  >
>;

export async function findById(id: string): Promise<SerializedUser | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await UserModel.findById(id).lean();
  return serialize(doc) ?? null;
}

export async function findByEmail(email: string): Promise<SerializedUser | null> {
  const doc = await UserModel.findOne({ email: email.trim().toLowerCase() }).lean();
  return serialize(doc) ?? null;
}

export async function findByPhone(phone: string): Promise<SerializedUser | null> {
  const doc = await UserModel.findOne({ phone: phone.trim() }).lean();
  return serialize(doc) ?? null;
}

export async function findByGoogleId(googleId: string): Promise<SerializedUser | null> {
  const doc = await UserModel.findOne({ googleId }).lean();
  return serialize(doc) ?? null;
}

export async function create(input: CreateUserInput): Promise<SerializedUser> {
  const doc = await UserModel.create(input);
  return serialize(doc.toObject()) as SerializedUser;
}

export async function updateById(
  id: string,
  input: UpdateUserInput,
): Promise<SerializedUser | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await UserModel.findByIdAndUpdate(id, { $set: input }, { new: true }).lean();
  return serialize(doc) ?? null;
}

export async function banUser(
  id: string,
  banned: boolean,
  banReason?: string,
): Promise<SerializedUser | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await UserModel.findByIdAndUpdate(
    id,
    {
      $set: {
        isBanned: banned,
        banReason: banned ? banReason : undefined,
      },
    },
    { new: true },
  ).lean();
  return serialize(doc) ?? null;
}

export async function updateRating(
  id: string,
  avg: number,
  count: number,
): Promise<SerializedUser | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await UserModel.findByIdAndUpdate(
    id,
    { $set: { rating: { avg, count } } },
    { new: true },
  ).lean();
  return serialize(doc) ?? null;
}

export async function findManyByIds(ids: string[]): Promise<SerializedUser[]> {
  const objectIds = ids.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
  if (!objectIds.length) return [];
  const docs = await UserModel.find({ _id: { $in: objectIds } }).lean();
  return serializeMany(docs);
}
