export type Serialized<T extends { _id?: unknown }> = Omit<T, "_id"> & { id: string };

export function serialize<T extends { _id?: unknown }>(
  doc: T | null | undefined,
): Serialized<T> | null | undefined {
  if (!doc) return doc;
  const { _id, ...rest } = doc as T & { _id: { toString(): string } };
  return { ...rest, id: _id?.toString?.() ?? String(_id) };
}

export function serializeMany<T extends { _id?: unknown }>(docs: T[]): Serialized<T>[] {
  return docs.map((doc) => serialize(doc) as Serialized<T>);
}
