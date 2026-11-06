"use client";

import { type FormEvent, useEffect, useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { CheckIcon, ChevronDownIcon, FileImageIcon, LinkIcon, PencilIcon, PenLineIcon, PlusIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  useRecipeLibraryActions,
} from "@/components/dashboard/use-recipe-library";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createCustomRecipe,
  slugifyRecipeTitle,
  type CustomRecipe,
} from "@/lib/recipe-library";
import { cuisineMessageKeys, cuisines } from "@/components/dashboard/recipe-options";
import { getRecipeImageSrc, MAX_RECIPE_IMAGE_MB, validateRecipeImage } from "@/lib/recipe-image";
import { deleteRecipeImage, uploadRecipeImage } from "@/lib/recipe-image-storage";

type RecipeFormState = {
  title: string;
  description: string;
  cuisine: string;
  time: string;
  servings: string;
  ingredients: string;
  steps: string;
};

function getInitialForm(recipe?: CustomRecipe): RecipeFormState {
  return {
    title: recipe?.title ?? "",
    description: recipe?.description ?? "",
    cuisine: recipe?.cuisine ?? "Inna",
    time: String(recipe?.time ?? 30),
    servings: String(recipe?.servings ?? 2),
    ingredients: recipe?.ingredients.map((ingredient) => `${ingredient.name} | ${ingredient.amount}`).join("\n") ?? "",
    steps: recipe?.steps.join("\n") ?? "",
  };
}

export function AddRecipeDialog() {
  return <RecipeFormDialog />;
}

export function EditRecipeDialog({ recipe }: { recipe: CustomRecipe }) {
  return <RecipeFormDialog recipe={recipe} />;
}

function RecipeFormDialog({ recipe }: { recipe?: CustomRecipe }) {
  const t = useTranslations("RecipeForm");
  const common = useTranslations("Common");
  const editing = Boolean(recipe);
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => getInitialForm(recipe));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [checkingImage, setCheckingImage] = useState(false);
  const { saveCustomRecipe, updateCustomRecipe } = useRecipeLibraryActions();

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  function update(field: keyof RecipeFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      setForm(getInitialForm(recipe));
      setError("");
    }
    setImageFile(null);
    setPreviewUrl(null);
    setRemoveImage(false);
    setImageError("");
    setCheckingImage(false);
    setOpen(nextOpen);
  }

  async function selectImage(file: File) {
    setCheckingImage(true);
    try {
      const validationError = await validateRecipeImage(file);
      if (validationError) {
        setImageError(t(`image.errors.${validationError}`, { maxMb: MAX_RECIPE_IMAGE_MB }));
        return;
      }
      setImageError("");
      setImageFile(file);
      setRemoveImage(false);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setCheckingImage(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || checkingImage || imageError) return;
    if (!form.title.trim() || !form.ingredients.trim() || !form.steps.trim() || form.ingredients.split("\n").some((line) => line.trim() && !line.split("|")[0].trim())) {
      setError(t("errors.required"));
      return;
    }

    const totalTime = Math.max(1, Number(form.time) || 1);

    startTransition(async () => {
      let uploadedImagePath: string | undefined;
      try {
        if (imageFile) uploadedImagePath = await uploadRecipeImage(imageFile);
        const imagePath = uploadedImagePath ?? (removeImage ? undefined : recipe?.imagePath);
        const customRecipe = createCustomRecipe(
          {
            title: form.title,
            imagePath,
            description: form.description,
            cuisine: form.cuisine,
            time: totalTime,
            activeTime: recipe?.activeTime && recipe.activeTime <= totalTime ? recipe.activeTime : undefined,
            servings: Math.max(1, Number(form.servings) || 1),
            ingredients: form.ingredients,
            steps: form.steps,
            nutrition: recipe?.macros && recipe.calories ? { calories: recipe.calories, ...recipe.macros } : undefined,
            allergens: recipe?.allergens,
            dietTags: recipe?.dietTags,
          },
          recipe?.slug ?? `${slugifyRecipeTitle(form.title) || "przepis"}-${crypto.randomUUID().slice(0, 8)}`,
          recipe?.createdAt ?? new Date().toISOString(),
        );
        if (editing) await updateCustomRecipe(customRecipe);
        else await saveCustomRecipe(customRecipe);
        if (recipe?.imagePath && recipe.imagePath !== imagePath) {
          void deleteRecipeImage(recipe.imagePath).catch(() => {});
        }
      } catch {
        if (uploadedImagePath) void deleteRecipeImage(uploadedImagePath).catch(() => {});
        setError(common("saveFailed"));
        return;
      }
      changeOpen(false);
      toast.success(editing ? t("toasts.updated") : t("toasts.created"));
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isPending) changeOpen(nextOpen); }}>
      <DialogTrigger
        render={
          editing ? (
            <Button variant="outline" size="icon-lg" className="size-11" aria-label={t("editLabel", { title: recipe?.title ?? "" })} />
          ) : (
            <Button className="h-11" />
          )
        }
      >
        {editing ? <PencilIcon aria-hidden="true" /> : <><PlusIcon aria-hidden="true" /> {t("add")}</>}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>
            {editing ? t("description") : t("addDescription")}
          </DialogDescription>
        </DialogHeader>
        {editing ? (
          <ManualRecipeForm
            editing
            fieldId={fieldId}
            form={form}
            error={error}
            saving={isPending}
            imageSrc={previewUrl ?? (!removeImage && recipe ? getRecipeImageSrc(recipe) : null)}
            imageError={imageError}
            checkingImage={checkingImage}
            selectImage={selectImage}
            removeImage={() => { setImageFile(null); setPreviewUrl(null); setRemoveImage(true); setImageError(""); }}
            update={update}
            submit={submit}
            close={() => changeOpen(false)}
          />
        ) : (
          <Tabs defaultValue="manual">
            <TabsList className="h-11!">
              <TabsTrigger value="manual" className="h-9 px-3">
                <PenLineIcon aria-hidden="true" /> {t("tabs.manual")}
              </TabsTrigger>
              <TabsTrigger value="link" className="h-9 px-3">
                <LinkIcon aria-hidden="true" /> {t("tabs.link")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="pt-3">
              <ManualRecipeForm
                editing={false}
                fieldId={fieldId}
                form={form}
                error={error}
                saving={isPending}
                imageSrc={previewUrl}
                imageError={imageError}
                checkingImage={checkingImage}
                selectImage={selectImage}
                removeImage={() => { setImageFile(null); setPreviewUrl(null); setRemoveImage(true); setImageError(""); }}
                update={update}
                submit={submit}
                close={() => changeOpen(false)}
              />
            </TabsContent>
            <TabsContent value="link" className="pt-3">
              <LinkRecipeForm close={() => setOpen(false)} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ManualRecipeForm({
  editing,
  fieldId,
  form,
  error,
  saving,
  imageSrc,
  imageError,
  checkingImage,
  selectImage,
  removeImage,
  update,
  submit,
  close,
}: {
  editing: boolean;
  fieldId: string;
  form: RecipeFormState;
  error: string;
  saving: boolean;
  imageSrc: string | null;
  imageError: string;
  checkingImage: boolean;
  selectImage: (file: File) => void;
  removeImage: () => void;
  update: (field: keyof RecipeFormState, value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  close: () => void;
}) {
  const t = useTranslations("RecipeForm");
  const recipeT = useTranslations("Recipe");
  const common = useTranslations("Common");
  const imageInputRef = useRef<HTMLInputElement>(null);
  let saveLabel = editing ? t("saveChanges") : t("save");
  if (saving) saveLabel = editing ? common("saving") : common("adding");

  return (
    <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`${fieldId}-image`}>{t("image.label")}</Label>
            <input
              ref={imageInputRef}
              id={`${fieldId}-image`}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="sr-only"
              aria-label={t("image.choose")}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void selectImage(file);
              }}
            />
            <div
              className="subtle-grid flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-input bg-muted/30 px-5 py-6 text-center"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!saving && !checkingImage && event.dataTransfer.files[0]) void selectImage(event.dataTransfer.files[0]);
              }}
            >
              {imageSrc ? (
                <div className="relative h-36 w-full overflow-hidden rounded-lg bg-secondary">
                  <Image src={imageSrc} alt="" fill sizes="(max-width: 640px) 100vw, 640px" className="object-cover" unoptimized />
                </div>
              ) : (
                <>
                  <span className="flex size-14 items-center justify-center rounded-full bg-card text-primary shadow-sm">
                    <FileImageIcon className="size-6" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-lg font-extrabold">{t("image.title")}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("image.description")}</p>
                </>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button type="button" className="h-11" disabled={saving || checkingImage} onClick={() => imageInputRef.current?.click()}>
                  <UploadIcon aria-hidden="true" /> {t(imageSrc ? "image.change" : "image.choose")}
                </Button>
                {imageSrc ? <Button type="button" variant="outline" className="h-11" disabled={saving || checkingImage} onClick={removeImage}>{t("image.remove")}</Button> : null}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t("image.formats", { maxMb: MAX_RECIPE_IMAGE_MB })}</p>
            </div>
            {imageError ? <p role="alert" className="text-sm text-destructive">{imageError}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("name")} htmlFor={`${fieldId}-title`} className="sm:col-span-2">
              <Input id={`${fieldId}-title`} className="h-11" value={form.title} onChange={(event) => update("title", event.target.value)} />
            </Field>
            <Field label={t("recipeDescription")} htmlFor={`${fieldId}-description`} className="sm:col-span-2">
              <Input id={`${fieldId}-description`} className="h-11" value={form.description} onChange={(event) => update("description", event.target.value)} />
            </Field>
            <Field label={t("cuisine")} htmlFor={`${fieldId}-cuisine`} className="sm:col-span-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  id={`${fieldId}-cuisine`}
                  render={
                    <Button type="button" variant="outline" className="h-11 w-full justify-between px-3 font-normal">
                      <span>{recipeT(`cuisineOptions.${cuisineMessageKeys[form.cuisine as keyof typeof cuisineMessageKeys] ?? "other"}`)}</span>
                      <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                  {cuisines.map((cuisine) => (
                    <DropdownMenuItem key={cuisine} onClick={() => update("cuisine", cuisine)}>
                      <span className="flex-1">{recipeT(`cuisineOptions.${cuisineMessageKeys[cuisine]}`)}</span>
                      {form.cuisine === cuisine ? <CheckIcon aria-hidden="true" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <Field label={t("time")} htmlFor={`${fieldId}-time`}>
                <Input id={`${fieldId}-time`} type="number" min="1" className="h-11" value={form.time} onChange={(event) => update("time", event.target.value)} />
              </Field>
              <Field label={t("servings")} htmlFor={`${fieldId}-servings`}>
                <Input id={`${fieldId}-servings`} type="number" min="1" className="h-11" value={form.servings} onChange={(event) => update("servings", event.target.value)} />
              </Field>
            </div>
            <Field label={t("ingredients")} htmlFor={`${fieldId}-ingredients`} className="sm:col-span-2">
              <Textarea id={`${fieldId}-ingredients`} placeholder={t("ingredientsPlaceholder")} value={form.ingredients} onChange={(event) => update("ingredients", event.target.value)} />
            </Field>
            <Field label={t("preparation")} htmlFor={`${fieldId}-steps`} className="sm:col-span-2">
              <Textarea id={`${fieldId}-steps`} placeholder={t("stepsPlaceholder")} value={form.steps} onChange={(event) => update("steps", event.target.value)} />
            </Field>
          </div>
          {error ? <p role="alert" className="text-sm font-semibold text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" className="h-11" disabled={saving} onClick={close}>{t("cancel")}</Button>
            <Button type="submit" className="h-11" disabled={saving || checkingImage || Boolean(imageError)} aria-busy={saving}>{saveLabel}</Button>
          </DialogFooter>
    </form>
  );
}

function LinkRecipeForm({ close }: { close: () => void }) {
  const t = useTranslations("RecipeForm");
  const fieldId = useId();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      setError(t("link.error"));
      return;
    }
    setError("");
    toast.info(t("link.comingSoon"));
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
          <LinkIcon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-base font-bold">{t("link.title")}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("link.description")}</p>
        <div className="mt-4 flex flex-wrap gap-2" aria-label={t("link.supported")}>
          {(["website", "instagram", "tiktok", "youtube"] as const).map((source) => (
            <Badge key={source} variant="outline">{t(`link.sources.${source}`)}</Badge>
          ))}
        </div>
      </div>
      <Field label={t("link.label")} htmlFor={`${fieldId}-url`}>
        <Input
          id={`${fieldId}-url`}
          type="url"
          className="h-11"
          placeholder={t("link.placeholder")}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          autoFocus
        />
      </Field>
      {error ? <p role="alert" className="text-sm font-semibold text-destructive">{error}</p> : null}
      <DialogFooter>
        <Button type="button" variant="outline" className="h-11" onClick={close}>{t("cancel")}</Button>
        <Button type="submit" className="h-11"><LinkIcon aria-hidden="true" /> {t("link.action")}</Button>
      </DialogFooter>
    </form>
  );
}

export function DeleteRecipeDialog({ recipe }: { recipe: CustomRecipe }) {
  const t = useTranslations("RecipeForm");
  const common = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { deleteCustomRecipe } = useRecipeLibraryActions();

  function removeRecipe() {
    if (isPending) return;
    startTransition(async () => {
      try {
        await deleteCustomRecipe(recipe.slug);
        if (recipe.imagePath) void deleteRecipeImage(recipe.imagePath).catch(() => {});
      } catch {
        toast.error(common("saveFailed"));
        return;
      }
      setOpen(false);
      toast.success(t("toasts.deleted"));
    });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isPending) setOpen(nextOpen); }}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="icon-lg" className="size-11" aria-label={t("deleteLabel", { title: recipe.title })} />
        }
      >
        <Trash2Icon aria-hidden="true" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("deleteDescription", { title: recipe.title })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-11" disabled={isPending} onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button type="button" variant="destructive" className="h-11" disabled={isPending} aria-busy={isPending} onClick={removeRecipe}>{isPending ? common("deleting") : t("delete")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-2">{label}</Label>
      {children}
    </div>
  );
}
