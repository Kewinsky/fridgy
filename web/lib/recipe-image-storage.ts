import { createClient } from "@/lib/supabase/client";
import { isRecipeImageFilename, RECIPE_IMAGE_BUCKET, validateRecipeImage } from "@/lib/recipe-image";

export async function uploadRecipeImage(file: File): Promise<string> {
  const error = await validateRecipeImage(file);
  if (error) throw new Error(error);
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");
  const extension = file.name.split(".").pop()!.toLowerCase();
  const filename = `${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(RECIPE_IMAGE_BUCKET)
    .upload(`${user.id}/${filename}`, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  return filename;
}

export async function deleteRecipeImage(filename: string): Promise<void> {
  if (!isRecipeImageFilename(filename)) return;
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");
  const { error } = await supabase.storage.from(RECIPE_IMAGE_BUCKET).remove([`${user.id}/${filename}`]);
  if (error) throw new Error(error.message);
}
