"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { siteConfig } from "@/config/site";
import type { AdImage } from "@/types";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageUploaderProps = {
  value: AdImage[];
  onChange: (images: AdImage[]) => void;
  max?: number;
  className?: string;
};

export function ImageUploader({
  value,
  onChange,
  max = siteConfig.maxImagesPerAd,
  className,
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFromUrl = () => {
    try {
      const url = new URL(urlInput.trim()).toString();
      if (value.length >= max) {
        toast.error(`Maximum ${max} images`);
        return;
      }
      onChange([
        ...value,
        { url, publicId: `url-${Date.now()}`, order: value.length },
      ]);
      setUrlInput("");
    } catch {
      toast.error("Enter a valid image URL");
    }
  };

  const uploadFile = async (file: File) => {
    if (value.length >= max) {
      toast.error(`Maximum ${max} images`);
      return;
    }

    try {
      const signRes = await apiFetch<{
        timestamp: number;
        folder: string;
        signature: string;
        apiKey: string;
        cloudName: string;
      }>("/api/uploads/sign", { method: "POST", body: {} });

      if (!signRes.success) {
        throw new Error(signRes.error.message);
      }

      const { timestamp, folder, signature, apiKey, cloudName } = signRes.data;
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form },
      );
      const json = (await uploadRes.json()) as {
        secure_url?: string;
        public_id?: string;
        width?: number;
        height?: number;
        error?: { message?: string };
      };

      if (!uploadRes.ok || !json.secure_url || !json.public_id) {
        throw new Error(json.error?.message ?? "Upload failed");
      }

      onChange([
        ...value,
        {
          url: json.secure_url,
          publicId: json.public_id,
          width: json.width,
          height: json.height,
          order: value.length,
        },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed — paste a URL instead");
    }
  };

  const removeAt = (index: number) => {
    onChange(
      value
        .filter((_, i) => i !== index)
        .map((img, order) => ({ ...img, order })),
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((img, i) => (
          <div key={img.publicId} className="relative aspect-square overflow-hidden rounded-lg border">
            <Image src={img.url} alt="" fill className="object-cover" sizes="160px" />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute right-1 top-1 size-7"
              onClick={() => removeAt(i)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        {value.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ImagePlus className="size-6" />
            <span className="text-xs">Add photo</span>
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
          e.target.value = "";
        }}
      />
      <div className="space-y-2">
        <Label htmlFor="image-url" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link2 className="size-3.5" />
          Or paste image URL (demo fallback)
        </Label>
        <div className="flex gap-2">
          <Input
            id="image-url"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button type="button" variant="secondary" onClick={addFromUrl}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
