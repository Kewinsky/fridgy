"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, LoaderCircleIcon, MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  initialError?: string;
  nextPath?: string;
};

export function LoginForm({ initialError, nextPath = "/dashboard" }: LoginFormProps) {
  const t = useTranslations("Login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState(initialError ?? "");
  const [pending, setPending] = useState(false);

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        shouldCreateUser: true,
      },
    });

    setPending(false);

    if (authError) {
      setError(t("errors.sendCode"));
      return;
    }

    setStep("code");
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (authError) {
      setPending(false);
      setError(t("errors.invalidCode"));
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  async function signInWithGoogle() {
    setPending(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (authError) {
      setPending(false);
      setError(t("errors.google"));
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={verifyCode} className="space-y-5">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 px-0 text-sm font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={() => {
            setStep("email");
            setCode("");
            setError("");
          }}
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          {t("changeEmail")}
        </Button>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("checkInbox")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("codeSent", { email })}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">{t("loginCode")}</Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="h-12 text-center text-xl font-bold tracking-[0.35em]"
            placeholder="000000"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={pending || code.length !== 6}
        >
          {pending ? (
            <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
          ) : null}
          {t("signIn")}
        </Button>
      </form>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t("welcome")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("welcomeDescription")}
        </p>
      </div>

      <form onSubmit={sendCode} className="mt-7 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <div className="relative">
            <MailIcon
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 pl-10 text-base"
              placeholder="ty@example.com"
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 w-full text-base"
          disabled={pending}
        >
          {pending ? (
            <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
          ) : null}
          {t("sendCode")}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full text-base"
        disabled={pending}
        onClick={signInWithGoogle}
      >
        {t("google")}
      </Button>

      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        {t("terms")}
      </p>
    </div>
  );
}
