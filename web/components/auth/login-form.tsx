"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, LoaderCircleIcon, MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  initialError?: string;
};

export function LoginForm({ initialError }: LoginFormProps) {
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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        shouldCreateUser: true,
      },
    });

    setPending(false);

    if (authError) {
      setError("Nie udało się wysłać kodu. Spróbuj ponownie.");
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
      setError("Kod jest nieprawidłowy lub wygasł.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function signInWithGoogle() {
    setPending(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (authError) {
      setPending(false);
      setError("Nie udało się rozpocząć logowania przez Google.");
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
          Zmień adres e-mail
        </Button>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Sprawdź skrzynkę
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Wysłaliśmy kod na <strong className="text-foreground">{email}</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Kod logowania</Label>
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
          Zaloguj się
        </Button>
      </form>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Witaj we Fridgy</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Zaloguj się bez hasła i wróć do swoich zapasów.
        </p>
      </div>

      <form onSubmit={sendCode} className="mt-7 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Adres e-mail</Label>
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
          Wyślij kod
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        lub
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full text-base"
        disabled={pending}
        onClick={signInWithGoogle}
      >
        Kontynuuj z Google
      </Button>

      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        Logując się, akceptujesz zasady korzystania z Fridgy.
      </p>
    </div>
  );
}
