"use client";

import { type FormEvent, useId, useState } from "react";
import { CheckIcon, ChevronDownIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  deleteCustomRecipe,
  saveCustomRecipe,
  updateCustomRecipe,
} from "@/components/dashboard/use-recipe-library";
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
import {
  createCustomRecipe,
  slugifyRecipeTitle,
  type CustomRecipe,
} from "@/lib/recipe-library";

const cuisines = [
  "Domowa",
  "Polska",
  "Włoska",
  "Azjatycka",
  "Meksykańska",
  "Śródziemnomorska",
  "Bliskowschodnia",
  "Amerykańska",
  "Europejska",
  "Inna",
] as const;

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
      setError("Uzupełnij nazwę, składniki i sposób przygotowania.");
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
    toast.success(editing ? "Zapisano zmiany przepisu" : "Przepis został zapisany");
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger
        render={
          editing ? (
            <Button variant="outline" size="icon-lg" className="size-11" aria-label={`Edytuj ${recipe?.title}`} />
          ) : (
            <Button className="h-11" />
          )
        }
      >
        {editing ? <PencilIcon aria-hidden="true" /> : <><PlusIcon aria-hidden="true" /> Dodaj przepis</>}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edytuj przepis" : "Dodaj własny przepis"}</DialogTitle>
          <DialogDescription>
            Każdy składnik i krok wpisz w osobnym wierszu. Ilość oddziel znakiem |.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nazwa przepisu" htmlFor={`${fieldId}-title`} className="sm:col-span-2">
              <Input id={`${fieldId}-title`} className="h-11" value={form.title} onChange={(event) => update("title", event.target.value)} />
            </Field>
            <Field label="Opis" htmlFor={`${fieldId}-description`} className="sm:col-span-2">
              <Input id={`${fieldId}-description`} className="h-11" value={form.description} onChange={(event) => update("description", event.target.value)} />
            </Field>
            <Field label="Kuchnia" htmlFor={`${fieldId}-cuisine`} className="sm:col-span-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  id={`${fieldId}-cuisine`}
                  render={
                    <Button type="button" variant="outline" className="h-11 w-full justify-between px-3 font-normal">
                      <span>{form.cuisine}</span>
                      <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="min-w-(--anchor-width)">
                  {cuisines.map((cuisine) => (
                    <DropdownMenuItem key={cuisine} onClick={() => update("cuisine", cuisine)}>
                      <span className="flex-1">{cuisine}</span>
                      {form.cuisine === cuisine ? <CheckIcon aria-hidden="true" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <Field label="Czas (min)" htmlFor={`${fieldId}-time`}>
                <Input id={`${fieldId}-time`} type="number" min="1" className="h-11" value={form.time} onChange={(event) => update("time", event.target.value)} />
              </Field>
              <Field label="Porcje" htmlFor={`${fieldId}-servings`}>
                <Input id={`${fieldId}-servings`} type="number" min="1" className="h-11" value={form.servings} onChange={(event) => update("servings", event.target.value)} />
              </Field>
            </div>
            <Field label="Składniki" htmlFor={`${fieldId}-ingredients`}>
              <Textarea id={`${fieldId}-ingredients`} placeholder={"Makaron | 200 g\nPomidory | 2 szt."} value={form.ingredients} onChange={(event) => update("ingredients", event.target.value)} />
            </Field>
            <Field label="Przygotowanie" htmlFor={`${fieldId}-steps`}>
              <Textarea id={`${fieldId}-steps`} placeholder={"Ugotuj makaron.\nPrzygotuj sos."} value={form.steps} onChange={(event) => update("steps", event.target.value)} />
            </Field>
          </div>
          {error ? <p role="alert" className="text-sm font-semibold text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" className="h-11" onClick={() => setOpen(false)}>Anuluj</Button>
            <Button type="submit" className="h-11">{editing ? "Zapisz zmiany" : "Zapisz przepis"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteRecipeDialog({ recipe }: { recipe: CustomRecipe }) {
  const [open, setOpen] = useState(false);

  function removeRecipe() {
    setOpen(false);
    deleteCustomRecipe(recipe.slug);
    toast.success("Przepis został usunięty");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="icon-lg" className="size-11" aria-label={`Usuń ${recipe.title}`} />
        }
      >
        <Trash2Icon aria-hidden="true" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usunąć przepis?</DialogTitle>
          <DialogDescription>
            Przepis „{recipe.title}” zniknie z Twojej biblioteki. Historia gotowania pozostanie zachowana.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-11" onClick={() => setOpen(false)}>Anuluj</Button>
          <Button type="button" variant="destructive" className="h-11" onClick={removeRecipe}>Usuń przepis</Button>
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
