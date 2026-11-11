import { createClient } from "@/lib/supabase/server";
import { requestReceiptItems } from "@/lib/receipt-analysis";
import { validateReceiptImage } from "@/lib/receipt-image";
import { finishUsage, reserveUsage } from "@/lib/subscription-usage";

const contentTypes: Record<string, "image/jpeg" | "image/png" | "image/webp"> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return Response.json({ error: "unavailable" }, { status: 503 });
  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > 4 * 1024 * 1024 + 4096)
    return Response.json({ error: "fileTooLarge" }, { status: 413 });

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("image");
  } catch {
    return Response.json({ error: "invalidFile" }, { status: 400 });
  }
  if (!(file instanceof File)) return Response.json({ error: "invalidFile" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024)
    return Response.json({ error: "fileTooLarge" }, { status: 413 });
  const fileError = await validateReceiptImage(file);
  if (fileError) return Response.json({ error: fileError }, { status: 400 });
  const mime = contentTypes[file.name.split(".").pop()?.toLowerCase() ?? ""];
  if (!mime) return Response.json({ error: "invalidFile" }, { status: 400 });

  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("household_id").eq("user_id", user.id).single();
  if (profileError || !profile?.household_id) return Response.json({ error: "unavailable" }, { status: 503 });
  const reservation = await reserveUsage(supabase, profile.household_id, "receipt");
  if (!reservation) return Response.json({ error: "limitReached" }, { status: 429 });

  try {
    const items = await requestReceiptItems(key, Buffer.from(await file.arrayBuffer()), mime);
    if (!items.length || request.signal.aborted) {
      await finishUsage(supabase, reservation, false);
      return Response.json({ error: "noProducts" }, { status: 422 });
    }
    await finishUsage(supabase, reservation, true);
    return Response.json({ items });
  } catch (error) {
    await finishUsage(supabase, reservation, false).catch(() => {});
    console.error("Receipt analysis failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "analysisFailed" }, { status: 502 });
  }
}
