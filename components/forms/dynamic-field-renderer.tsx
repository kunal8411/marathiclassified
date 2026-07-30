"use client";

import * as React from "react";

import type { DynamicField } from "@/types";
import { getLocalizedName } from "@/lib/i18n";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DynamicFieldRendererProps = {
  fields: DynamicField[];
  locale: "en" | "mr";
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
};

export function DynamicFieldRenderer({
  fields,
  locale,
  values,
  onChange,
}: DynamicFieldRendererProps) {
  if (!fields.length) return null;

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const label = getLocalizedName(field.label, locale);
        const id = `attr-${field.key}`;

        if (field.type === "boolean") {
          return (
            <div key={field.key} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={Boolean(values[field.key])}
                onCheckedChange={(checked) => onChange(field.key, Boolean(checked))}
              />
              <Label htmlFor={id}>{label}</Label>
            </div>
          );
        }

        if (field.type === "select" && field.options?.length) {
          return (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={id}>{label}</Label>
              <Select
                value={String(values[field.key] ?? "")}
                onValueChange={(v) => onChange(field.key, v)}
              >
                <SelectTrigger id={id}>
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt, i) => (
                    <SelectItem key={i} value={getLocalizedName(opt, locale)}>
                      {getLocalizedName(opt, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
              id={id}
              type={field.type === "number" ? "number" : "text"}
              required={field.required}
              value={String(values[field.key] ?? "")}
              onChange={(e) =>
                onChange(
                  field.key,
                  field.type === "number" ? Number(e.target.value) : e.target.value,
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
}
