import { createClient } from "@/lib/supabase/client";
import { isRecipeImageFilename } from "@/lib/recipe-image";
import { PROFILE_IMAGE_BUCKET, validateProfileImage } from "@/lib/profile-image";

export async function saveProfileImage(file: File, previousPath: string | null): Promise<string> {
  const validationError = await validateProfileImage(file);
  if (validationError) throw new Error(validationError);

  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const extension = file.name.split(".").pop()!.toLowerCase();
  const filename = `${crypto.randomUUID()}.${extension}`;
  const path = `${user.id}/${filename}`;
  const { error: uploadError } = await supabase.storage.from(PROFILE_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error: updateError } = await supabase.from("profiles")
    .update({ avatar_path: filename }).eq("user_id", user.id).select("avatar_path").single();
  if (updateError) {
    await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([path]);
    throw new Error(updateError.message);
  }

  if (previousPath && isRecipeImageFilename(previousPath)) {
    await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([`${user.id}/${previousPath}`]);
  }
  return filename;
}

export async function removeProfileImage(previousPath: string): Promise<void> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const { error: updateError } = await supabase.from("profiles")
    .update({ avatar_path: null }).eq("user_id", user.id).select("avatar_path").single();
  if (updateError) throw new Error(updateError.message);

  if (isRecipeImageFilename(previousPath)) {
    await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([`${user.id}/${previousPath}`]);
  }
}
