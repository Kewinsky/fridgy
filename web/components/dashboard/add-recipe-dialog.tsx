"use client";

import { type FormEvent, useId, useState } from "react";
import { CheckIcon, ChevronDownIcon, LinkIcon, PencilIcon, PenLineIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  deleteCustomRecipe,
  saveCustomRecipe,
  updateCustomRecipe,
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
    ingredients: recipe?.ingredients
      .map((ingredient) => `${ingredient.name} | ${ingredient.amount}`)
      .join("\n") ?? "",
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
  const editing = Boolean(recipe);
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => getInitialForm(recipe));
  const [error, setError] = useState("");

  function update(field: keyof RecipeFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      setForm(getInitialForm(recipe));
      setError("");
    }
    setOpen(nextOpen);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.ingredients.trim() || !form.steps.trim()) {
      setError(t("errors.required"));
      return;
    }

    const customRecipe = createCustomRecipe(
      {
        title: form.title,
        description: form.description,
        cuisine: form.cuisine,
        time: Math.max(1, Number(form.time) || 1),
        servings: Math.max(1, Number(form.servings) || 1),
        ingredients: form.ingredients,
        steps: form.steps,
      },
      recipe?.slug ?? `${slugifyRecipeTitle(form.title) || "przepis"}-${crypto.randomUUID().slice(0, 8)}`,
      recipe?.createdAt ?? new Date().toISOString(),
    );

    if (editing) updateCustomRecipe(customRecipe);
    else saveCustomRecipe(customRecipe);
    setOpen(false);
    toast.success(editing ? t("toasts.updated") : t("toasts.created"));
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
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
            update={update}
            submit={submit}
            close={() => setOpen(false)}
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
                update={update}
                submit={submit}
                close={() => setOpen(false)}
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
  update,
  submit,
  close,
}: {
  editing: boolean;
  fieldId: string;
  form: RecipeFormState;
  error: string;
  update: (field: keyof RecipeFormState, value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  close: () => void;
}) {
  const t = useTranslations("RecipeForm");
  const recipeT = useTranslations("Recipe");

  return (
    <form onSubmit={submit} className="grid gap-4">
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
            <Field label={t("ingredients")} htmlFor={`${fieldId}-ingredients`}>
              <Textarea id={`${fieldId}-ingredients`} placeholder={t("ingredientsPlaceholder")} value={form.ingredients} onChange={(event) => update("ingredients", event.target.value)} />
            </Field>
            <Field label={t("preparation")} htmlFor={`${fieldId}-steps`}>
              <Textarea id={`${fieldId}-steps`} placeholder={t("stepsPlaceholder")} value={form.steps} onChange={(event) => update("steps", event.target.value)} />
            </Field>
          </div>
          {error ? <p role="alert" className="text-sm font-semibold text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" className="h-11" onClick={close}>{t("cancel")}</Button>
            <Button type="submit" className="h-11">{editing ? t("saveChanges") : t("save")}</Button>
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
  const [open, setOpen] = useState(false);

  function removeRecipe() {
    setOpen(false);
    deleteCustomRecipe(recipe.slug);
    toast.success(t("toasts.deleted"));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button type="button" variant="outline" className="h-11" onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button type="button" variant="destructive" className="h-11" onClick={removeRecipe}>{t("delete")}</Button>
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
