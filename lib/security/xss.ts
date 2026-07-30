import xss, { type IFilterXSSOptions } from "xss";

const options: IFilterXSSOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
};

export function sanitizeText(input: string): string {
  return xss(input, options).trim();
}

export function sanitizeOptionalText(input?: string | null): string | undefined {
  if (input == null) return undefined;
  const cleaned = sanitizeText(input);
  return cleaned.length ? cleaned : undefined;
}
