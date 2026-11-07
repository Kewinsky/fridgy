import { isRecipeImageFilename, validateRecipeImage, type RecipeImageError } from "./recipe-image.ts";

export const PROFILE_IMAGE_BUCKET = "profile-images";
export const MAX_PROFILE_IMAGE_MB = 2;

export async function validateProfileImage(file: File): Promise<RecipeImageError | null> {
  if (file.size > MAX_PROFILE_IMAGE_MB * 1024 * 1024) return "tooLarge";
  return validateRecipeImage(file);
}

export function getProfileImageSrc(filename: string | null): string | null {
  return filename && isRecipeImageFilename(filename)
    ? `/api/profile-images/${encodeURIComponent(filename)}`
    : null;
}
