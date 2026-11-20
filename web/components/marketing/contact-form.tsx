"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckIcon, LoaderCircleIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTACT_LIMITS,
  CONTACT_MIN_MESSAGE_LENGTH,
  contactMessageSchema,
  type ContactMessage,
} from "@/lib/contact";

const emptyMessage: ContactMessage = {
  name: "",
  email: "",
  subject: "",
  message: "",
};
const inputFields = [
  { name: "name", type: "text", autoComplete: "name" },
  { name: "email", type: "email", autoComplete: "email" },
  { name: "subject", type: "text", autoComplete: "off" },
] as const;

export function ContactForm() {
  const t = useTranslations("ContactForm");
  const [values, setValues] = useState(emptyMessage);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactMessage, string[]>>
  >({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const sending = useRef(false);

  function fieldError(field: keyof ContactMessage) {
    const error = errors[field]?.[0];
    if (!error) return null;
    return (
      <p id={`contact-${field}-error`} className="text-sm text-destructive">
        {t(`errors.${error}`, {
          max: CONTACT_LIMITS[field],
          min: CONTACT_MIN_MESSAGE_LENGTH,
        })}
      </p>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const result = contactMessageSchema.safeParse(values);
    setStatus("idle");
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      const firstField = Object.keys(fieldErrors)[0];
      document.getElementById(`contact-${firstField}`)?.focus();
      return;
    }
    setErrors({});
    sending.current = true;
    setStatus("sending");
    try {
      // shortcut: /api/contact needs a delivery handler when the mail service is selected.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Contact message was not accepted");
      setStatus("sent");
      setValues(emptyMessage);
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  if (status === "sent")
    return (
      <section
        className="marketing-info-card flex min-h-96 flex-col items-center justify-center text-center"
        aria-labelledby="contact-success-title"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
          <CheckIcon className="size-8" aria-hidden="true" />
        </span>
        <h2
          id="contact-success-title"
          tabIndex={-1}
          ref={(node) => node?.focus()}
          className="marketing-display mt-6 text-3xl outline-none"
        >
          {t("successTitle")}
        </h2>
        <p
          role="status"
          className="mt-3 max-w-md text-sm leading-7 text-muted-foreground"
        >
          {t("successDescription")}
        </p>
        <Button
          variant="outline"
          className="mt-7 min-h-12 px-5"
          onClick={() => setStatus("idle")}
        >
          {t("sendAnother")}
        </Button>
      </section>
    );

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      aria-busy={status === "sending"}
      className="marketing-info-card"
      aria-labelledby="contact-form-title"
    >
      <h2 id="contact-form-title" className="marketing-display text-3xl">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("requiredNote")}
      </p>
      <fieldset
        disabled={status === "sending"}
        className="mt-7 grid min-w-0 gap-5 sm:grid-cols-2"
      >
        <legend className="sr-only">{t("title")}</legend>
        {inputFields.map(({ name, type, autoComplete }) => (
          <div
            key={name}
            className={
              name === "subject" ? "grid gap-2 sm:col-span-2" : "grid gap-2"
            }
          >
            <Label htmlFor={`contact-${name}`}>{t(`fields.${name}`)}</Label>
            <Input
              id={`contact-${name}`}
              name={name}
              type={type}
              autoComplete={autoComplete}
              required
              maxLength={CONTACT_LIMITS[name]}
              className="h-12 bg-card"
              value={values[name]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [name]: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors[name])}
              aria-describedby={
                errors[name] ? `contact-${name}-error` : undefined
              }
            />
            {fieldError(name)}
          </div>
        ))}
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="contact-message">{t("fields.message")}</Label>
          <Textarea
            id="contact-message"
            name="message"
            required
            minLength={CONTACT_MIN_MESSAGE_LENGTH}
            maxLength={CONTACT_LIMITS.message}
            rows={7}
            className="min-h-44 bg-card"
            value={values.message}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message
                ? "contact-message-error contact-message-hint"
                : "contact-message-hint"
            }
          />
          {fieldError("message")}
          <div className="flex items-start justify-between gap-4 text-xs leading-5 text-muted-foreground">
            <p id="contact-message-hint">{t("messageHint")}</p>
            <span className="shrink-0 tabular-nums">
              {values.message.length}/{CONTACT_LIMITS.message}
            </span>
          </div>
        </div>
      </fieldset>
      <p className="mt-5 text-xs leading-6 text-muted-foreground">
        {t.rich("privacy", {
          link: (chunks) => (
            <Link
              href="/prywatnosc"
              className="font-semibold text-primary underline underline-offset-4"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
      {status === "error" ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-6 text-destructive"
        >
          {t("sendError")}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 min-h-12 w-full px-6 sm:w-auto"
      >
        {status === "sending" ? (
          <LoaderCircleIcon
            className="size-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
        ) : (
          <SendIcon className="size-4" aria-hidden="true" />
        )}
        {t(status === "sending" ? "sending" : "send")}
      </Button>
    </form>
  );
}
