"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Locale } from "@/config/site";
import { getLocalizedName } from "@/lib/i18n";
import { useSellDraftStore } from "@/stores/sell-draft-store";
import { useCategories } from "@/hooks/use-categories";
import { useCreateAdDraft, usePublishAd, useUpdateAd } from "@/hooks/use-ad";
import { DynamicFieldRenderer } from "@/components/forms/dynamic-field-renderer";
import { ImageUploader } from "@/components/forms/image-uploader";
import { MultiStepForm } from "@/components/forms/multi-step-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/shared/loading-state";

const STEPS = [
  { id: "category", title: "Category" },
  { id: "details", title: "Details" },
  { id: "media", title: "Photos" },
  { id: "review", title: "Review" },
];

type SellFormProps = {
  locale: Locale;
  draftId?: string;
};

export function SellForm({ locale, draftId: initialDraftId }: SellFormProps) {
  const router = useRouter();
  const store = useSellDraftStore();
  const { data: categories, isLoading } = useCategories();
  const categoryMeta =
    categories?.find((c) => c.id === store.subcategoryId) ??
    categories?.find((c) => c.id === store.categoryId);
  const createDraft = useCreateAdDraft();
  const draftId = store.draftId ?? initialDraftId;
  const updateAd = useUpdateAd(draftId);
  const publishAd = usePublishAd(draftId);

  const goNext = async () => {
    const idx = STEPS.findIndex((s) => s.id === store.step);
    const next = STEPS[idx + 1]?.id;
    if (!next) return;

    if (store.step === "category" && !store.categoryId) {
      toast.error("Choose a category");
      return;
    }

    if (store.step === "details") {
      if (!store.title || !store.description || store.price === "" || !store.city) {
        toast.error("Fill in all required fields");
        return;
      }
      try {
        const payload = {
          title: store.title,
          description: store.description,
          price: Number(store.price),
          categoryId: store.categoryId!,
          subcategoryId: store.subcategoryId,
          location: {
            coordinates: [73.8567, 18.5204] as [number, number],
            city: store.city,
            area: store.area || undefined,
            state: "Maharashtra",
          },
          condition: store.condition,
          attributes: store.attributes,
          images: store.images,
        };
        if (!draftId) {
          const ad = await createDraft.mutateAsync(payload as unknown as import("@/services/ad.service").AdWriteInput);
          store.setDraftId(ad.id);
        } else {
          await updateAd.mutateAsync(payload as unknown as Partial<import("@/services/ad.service").AdWriteInput>);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save draft");
        return;
      }
    }

    if (store.step === "media" && draftId) {
      try {
        await updateAd.mutateAsync({
          images: store.images,
          attributes: store.attributes,
        } as Partial<import("@/services/ad.service").AdWriteInput>);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save photos");
        return;
      }
    }

    store.setStep(next as typeof store.step);
  };

  const goBack = () => {
    const idx = STEPS.findIndex((s) => s.id === store.step);
    const prev = STEPS[idx - 1]?.id;
    if (prev) store.setStep(prev as typeof store.step);
  };

  const onPublish = async () => {
    if (!draftId) return;
    try {
      await publishAd.mutateAsync();
      toast.success("Ad submitted for review");
      store.reset();
      router.push(`/${locale}/profile`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed");
    }
  };

  if (isLoading) return <LoadingState label="Loading categories…" />;

  const topLevel = categories?.filter((c) => !c.parentId) ?? categories ?? [];

  return (
    <MultiStepForm
      steps={STEPS}
      currentStep={store.step}
      onStepChange={(id) => store.setStep(id as typeof store.step)}
      onNext={store.step === "review" ? onPublish : goNext}
      onBack={goBack}
      nextLabel={store.step === "review" ? "Publish" : "Next"}
      isNextDisabled={createDraft.isPending || updateAd.isPending || publishAd.isPending}
    >
      {store.step === "category" ? (
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">Main category</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {topLevel.map((cat) => (
                <Button
                  key={cat.id}
                  type="button"
                  variant={store.categoryId === cat.id ? "default" : "outline"}
                  className="h-auto flex-col gap-1 py-4"
                  onClick={() =>
                    store.patch({
                      categoryId: cat.id,
                      subcategoryId: undefined,
                      attributes: {},
                    })
                  }
                >
                  {getLocalizedName(cat.name, locale)}
                </Button>
              ))}
            </div>
          </div>
          {store.categoryId ? (
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Subcategory (optional)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(categories ?? [])
                  .filter((c) => String(c.parentId ?? "") === store.categoryId)
                  .map((cat) => (
                    <Button
                      key={cat.id}
                      type="button"
                      variant={store.subcategoryId === cat.id ? "default" : "outline"}
                      className="h-auto py-3"
                      onClick={() => store.patch({ subcategoryId: cat.id })}
                    >
                      {getLocalizedName(cat.name, locale)}
                    </Button>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {store.step === "details" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={store.title}
              onChange={(e) => store.patch({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={store.description}
              onChange={(e) => store.patch({ description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={store.price}
                onChange={(e) =>
                  store.patch({
                    price: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={store.condition ?? ""}
                onValueChange={(v) =>
                  store.patch({ condition: v as "new" | "used" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={store.city}
                onChange={(e) => store.patch({ city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                value={store.area}
                onChange={(e) => store.patch({ area: e.target.value })}
              />
            </div>
          </div>
          {categoryMeta?.fieldSchema?.length ? (
            <DynamicFieldRenderer
              fields={categoryMeta.fieldSchema}
              locale={locale}
              values={store.attributes}
              onChange={(key, value) =>
                store.patch({ attributes: { ...store.attributes, [key]: value } })
              }
            />
          ) : null}
        </div>
      ) : null}

      {store.step === "media" ? (
        <div className="space-y-4">
          <ImageUploader
            value={store.images}
            onChange={(images) => store.patch({ images })}
          />
        </div>
      ) : null}

      {store.step === "review" ? (
        <div className="space-y-3 rounded-xl border bg-card p-4 text-sm">
          <p>
            <span className="text-muted-foreground">Title:</span> {store.title}
          </p>
          <p>
            <span className="text-muted-foreground">Price:</span> ₹{store.price}
          </p>
          <p>
            <span className="text-muted-foreground">Location:</span> {store.city}
            {store.area ? `, ${store.area}` : ""}
          </p>
          <p className="text-muted-foreground">{store.images.length} photo(s)</p>
          {draftId ? (
            <Button variant="link" asChild className="px-0">
              <Link href={`/${locale}/ads/${draftId}`}>Preview listing</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </MultiStepForm>
  );
}
