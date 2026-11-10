export function shouldRelocateRecipeImage(
  reference: { household_id: string; user_id: string | null; recipe: { imageOwnerId?: string } },
  deletedUserId: string,
  deletedHouseholds: ReadonlySet<string>,
): boolean {
  return !deletedHouseholds.has(reference.household_id)
    && (reference.recipe.imageOwnerId ?? reference.user_id) === deletedUserId;
}
