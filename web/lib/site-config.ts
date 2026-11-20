import { z } from "zod";

const siteConfigSchema = z.object({
  entityName: z.string().min(1).max(300),
  address: z.string().max(500),
  contactEmail: z.union([z.literal(""), z.email()]),
  phone: z.string().max(80),
  taxId: z.string().max(100),
  registerId: z.string().max(200),
  legalUpdatedAt: z.iso.date(),
  processors: z.string().min(1).max(1000),
});

export function getSiteConfig(
  env: Record<string, string | undefined> = process.env,
) {
  return siteConfigSchema.parse({
    entityName: env.LEGAL_ENTITY_NAME?.trim() || "Fridgy",
    address: env.LEGAL_ENTITY_ADDRESS?.trim() || "",
    contactEmail: env.CONTACT_EMAIL?.trim() || "",
    phone: env.CONTACT_PHONE?.trim() || "",
    taxId: env.LEGAL_TAX_ID?.trim() || "",
    registerId: env.LEGAL_REGISTER_ID?.trim() || "",
    legalUpdatedAt: env.LEGAL_UPDATED_AT?.trim() || "2026-11-20",
    processors:
      env.LEGAL_PROCESSORS?.trim() || "Supabase, Vercel, OpenAI, Stripe",
  });
}
