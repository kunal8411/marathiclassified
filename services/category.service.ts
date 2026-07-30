import { NotFoundError } from "@/lib/api/errors";
import * as categoryRepo from "@/repositories/category.repository";

export async function listCategories() {
  return categoryRepo.findAllActive();
}

export async function getBySlug(slug: string) {
  const category = await categoryRepo.findBySlug(slug);
  if (!category || !category.isActive) {
    throw new NotFoundError("Category not found");
  }
  return category;
}
