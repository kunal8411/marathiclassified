import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config();

import { connectDb } from "../lib/db/connect";
import { CategoryModel } from "../models/Category";
import { UserModel } from "../models/User";
import { hashPassword } from "../lib/auth/password";
import type { DynamicField } from "../types";

type SeedCategory = {
  slug: string;
  name: { en: string; mr: string };
  icon: string;
  order: number;
  fieldSchema?: DynamicField[];
  children?: Array<{
    slug: string;
    name: { en: string; mr: string };
    icon?: string;
    order: number;
    fieldSchema?: DynamicField[];
  }>;
};

const categories: SeedCategory[] = [
  {
    slug: "vehicles",
    name: { en: "Vehicles", mr: "वाहने" },
    icon: "car",
    order: 1,
    children: [
      {
        slug: "cars",
        name: { en: "Cars", mr: "कार" },
        order: 1,
        fieldSchema: [
          { key: "brand", type: "text", label: { en: "Brand", mr: "ब्रँड" }, required: true },
          { key: "year", type: "number", label: { en: "Year", mr: "वर्ष" }, required: true },
          { key: "km", type: "number", label: { en: "Kilometers", mr: "किलोमीटर" }, required: false },
          {
            key: "fuel",
            type: "select",
            label: { en: "Fuel", mr: "इंधन" },
            required: false,
            options: [
              { en: "Petrol", mr: "पेट्रोल" },
              { en: "Diesel", mr: "डिझेल" },
              { en: "CNG", mr: "सीएनजी" },
              { en: "Electric", mr: "इलेक्ट्रिक" },
            ],
          },
        ],
      },
      { slug: "bikes", name: { en: "Bikes", mr: "बाईक" }, order: 2 },
      { slug: "scooters", name: { en: "Scooters", mr: "स्कूटर" }, order: 3 },
      { slug: "commercial-vehicles", name: { en: "Commercial Vehicles", mr: "व्यावसायिक वाहने" }, order: 4 },
      { slug: "spare-parts", name: { en: "Spare Parts", mr: "स्पेअर पार्ट्स" }, order: 5 },
    ],
  },
  {
    slug: "mobiles",
    name: { en: "Mobiles", mr: "मोबाईल" },
    icon: "smartphone",
    order: 2,
    children: [
      {
        slug: "smartphones",
        name: { en: "Smartphones", mr: "स्मार्टफोन" },
        order: 1,
        fieldSchema: [
          { key: "brand", type: "text", label: { en: "Brand", mr: "ब्रँड" }, required: true },
          {
            key: "storage",
            type: "select",
            label: { en: "Storage", mr: "स्टोरेज" },
            required: false,
            options: [
              { en: "64 GB", mr: "६४ जीबी" },
              { en: "128 GB", mr: "१२८ जीबी" },
              { en: "256 GB", mr: "२५६ जीबी" },
              { en: "512 GB", mr: "५१२ जीबी" },
            ],
          },
        ],
      },
      { slug: "tablets", name: { en: "Tablets", mr: "टॅब्लेट" }, order: 2 },
      { slug: "mobile-accessories", name: { en: "Accessories", mr: "अॅक्सेसरीज" }, order: 3 },
      { slug: "wearables", name: { en: "Wearables", mr: "वेअरेबल्स" }, order: 4 },
    ],
  },
  {
    slug: "electronics",
    name: { en: "Electronics", mr: "इलेक्ट्रॉनिक्स" },
    icon: "laptop",
    order: 3,
    children: [
      { slug: "laptops", name: { en: "Laptops", mr: "लॅपटॉप" }, order: 1 },
      { slug: "tvs", name: { en: "TVs", mr: "टीव्ही" }, order: 2 },
      { slug: "cameras", name: { en: "Cameras", mr: "कॅमेरे" }, order: 3 },
      { slug: "audio", name: { en: "Audio & Headphones", mr: "ऑडिओ आणि हेडफोन" }, order: 4 },
      { slug: "computer-accessories", name: { en: "Computer Accessories", mr: "कॉम्प्युटर अॅक्सेसरीज" }, order: 5 },
    ],
  },
  {
    slug: "properties",
    name: { en: "Properties", mr: "मालमत्ता" },
    icon: "home",
    order: 4,
    children: [
      {
        slug: "apartments",
        name: { en: "Apartments / Flats", mr: "फ्लॅट्स" },
        order: 1,
        fieldSchema: [
          {
            key: "bhk",
            type: "select",
            label: { en: "BHK", mr: "बीएचके" },
            required: true,
            options: [
              { en: "1 BHK", mr: "१ बीएचके" },
              { en: "2 BHK", mr: "२ बीएचके" },
              { en: "3 BHK", mr: "३ बीएचके" },
              { en: "4+ BHK", mr: "४+ बीएचके" },
            ],
          },
          {
            key: "furnished",
            type: "boolean",
            label: { en: "Furnished", mr: "फर्निश्ड" },
            required: false,
          },
        ],
      },
      { slug: "houses", name: { en: "Houses", mr: "घरं" }, order: 2 },
      { slug: "plots", name: { en: "Plots / Land", mr: "प्लॉट / जमीन" }, order: 3 },
      { slug: "pg-hostel", name: { en: "PG / Hostel", mr: "पीजी / हॉस्टेल" }, order: 4 },
      { slug: "commercial-property", name: { en: "Commercial", mr: "व्यावसायिक जागा" }, order: 5 },
    ],
  },
  {
    slug: "furniture",
    name: { en: "Furniture", mr: "फर्निचर" },
    icon: "sofa",
    order: 5,
    children: [
      { slug: "sofa-dining", name: { en: "Sofa & Dining", mr: "सोफा आणि डायनिंग" }, order: 1 },
      { slug: "beds", name: { en: "Beds & Wardrobes", mr: "बेड आणि वॉर्डरोब" }, order: 2 },
      { slug: "home-decor", name: { en: "Home Decor", mr: "होम डेकोर" }, order: 3 },
      { slug: "kitchen-appliances", name: { en: "Kitchen Appliances", mr: "किचन उपकरणे" }, order: 4 },
    ],
  },
  {
    slug: "fashion",
    name: { en: "Fashion", mr: "फॅशन" },
    icon: "shirt",
    order: 6,
    children: [
      { slug: "men", name: { en: "Men", mr: "पुरुष" }, order: 1 },
      { slug: "women", name: { en: "Women", mr: "महिला" }, order: 2 },
      { slug: "kids-fashion", name: { en: "Kids", mr: "मुले" }, order: 3 },
      { slug: "footwear", name: { en: "Footwear", mr: "पादत्राणे" }, order: 4 },
    ],
  },
  {
    slug: "jobs",
    name: { en: "Jobs", mr: "नोकऱ्या" },
    icon: "briefcase",
    order: 7,
    children: [
      {
        slug: "full-time",
        name: { en: "Full-time", mr: "पूर्णवेळ" },
        order: 1,
        fieldSchema: [
          {
            key: "jobType",
            type: "select",
            label: { en: "Job type", mr: "नोकरीचा प्रकार" },
            required: true,
            options: [
              { en: "Full-time", mr: "पूर्णवेळ" },
              { en: "Part-time", mr: "अर्धवेळ" },
              { en: "Contract", mr: "करार" },
            ],
          },
        ],
      },
      { slug: "part-time", name: { en: "Part-time", mr: "अर्धवेळ" }, order: 2 },
      { slug: "internship", name: { en: "Internship", mr: "इंटर्नशिप" }, order: 3 },
      { slug: "work-from-home", name: { en: "Work from home", mr: "घरून काम" }, order: 4 },
    ],
  },
  {
    slug: "services",
    name: { en: "Services", mr: "सेवा" },
    icon: "wrench",
    order: 8,
    children: [
      { slug: "home-services", name: { en: "Home Services", mr: "घरगुती सेवा" }, order: 1 },
      { slug: "education-classes", name: { en: "Education & Classes", mr: "शिक्षण आणि क्लासेस" }, order: 2 },
      { slug: "health-beauty", name: { en: "Health & Beauty", mr: "आरोग्य आणि सौंदर्य" }, order: 3 },
      { slug: "drivers-tours", name: { en: "Drivers & Tours", mr: "ड्रायव्हर आणि टूर" }, order: 4 },
    ],
  },
];

async function upsertCategory(
  data: {
    slug: string;
    name: { en: string; mr: string };
    icon: string;
    order: number;
    parentId?: string | null;
    fieldSchema?: DynamicField[];
  },
) {
  return CategoryModel.findOneAndUpdate(
    { slug: data.slug },
    {
      slug: data.slug,
      name: data.name,
      icon: data.icon,
      order: data.order,
      parentId: data.parentId ?? null,
      isActive: true,
      fieldSchema: data.fieldSchema ?? [],
    },
    { upsert: true, new: true },
  );
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  await connectDb();

  let total = 0;
  for (const parent of categories) {
    const parentDoc = await upsertCategory({
      slug: parent.slug,
      name: parent.name,
      icon: parent.icon,
      order: parent.order,
      parentId: null,
      fieldSchema: parent.fieldSchema,
    });
    total += 1;

    for (const child of parent.children ?? []) {
      await upsertCategory({
        slug: child.slug,
        name: child.name,
        icon: child.icon ?? parent.icon,
        order: child.order,
        parentId: String(parentDoc._id),
        fieldSchema: child.fieldSchema,
      });
      total += 1;
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@marathiclassifieds.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const passwordHash = await hashPassword(adminPassword);

  await UserModel.findOneAndUpdate(
    { email: adminEmail },
    {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
      emailVerifiedAt: new Date(),
      isBanned: false,
    },
    { upsert: true, new: true },
  );

  console.log(`Seeded ${total} categories (parents + subcategories)`);
  console.log(`Admin ready: ${adminEmail}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
