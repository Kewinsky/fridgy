import { createClient } from "@/lib/supabase/server";
import { isRecipeImageFilename, RECIPE_IMAGE_BUCKET } from "@/lib/recipe-image";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!isRecipeImageFilename(filename)) {
    return new Response(null, { status: 404 });
  }
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return new Response(null, { status: 401 });

  const { data, error } = await supabase.storage.from(RECIPE_IMAGE_BUCKET)
    .download(`${user.id}/${filename}`);
  if (error || !data) return new Response(null, { status: 404 });

  const extension = filename.split(".").pop()!;
  return new Response(data, {
    headers: {
      "Content-Type": contentTypes[extension],
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
