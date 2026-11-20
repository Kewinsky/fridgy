import { z } from "zod";

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
} as const;
export const CONTACT_MIN_MESSAGE_LENGTH = 10;

export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "required")
    .max(CONTACT_LIMITS.name, "tooLong"),
  email: z
    .string()
    .trim()
    .min(1, "required")
    .max(CONTACT_LIMITS.email, "tooLong")
    .pipe(z.email("invalidEmail")),
  subject: z
    .string()
    .trim()
    .min(1, "required")
    .max(CONTACT_LIMITS.subject, "tooLong"),
  message: z
    .string()
    .trim()
    .min(CONTACT_MIN_MESSAGE_LENGTH, "messageShort")
    .max(CONTACT_LIMITS.message, "tooLong"),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;
