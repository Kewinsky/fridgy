"use client";

import { useState } from "react";
import Image from "next/image";
import { ChefHatIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export function RecipeImage({ src, sizes, unoptimized }: { src: string; sizes: string; unoptimized?: boolean }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <>
      {status === "loading" ? <Skeleton className="absolute inset-0 size-full rounded-none" aria-hidden="true" /> : null}
      {status === "error" ? <ChefHatIcon className="size-9" aria-hidden="true" /> : null}
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className={status === "loaded" ? "object-cover" : "invisible object-cover"}
        unoptimized={unoptimized}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </>
  );
}
