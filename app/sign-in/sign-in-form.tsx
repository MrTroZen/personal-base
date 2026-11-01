"use client";

import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn, type SignInState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton({ configured }: { configured: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      type="submit"
      size="lg"
      disabled={!configured || pending}
      aria-describedby={!configured ? "auth-configuration-message" : undefined}
    >
      {pending ? (
        <>
          <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
          Signing in…
        </>
      ) : (
        <>
          Continue to dashboard
          <ArrowRight aria-hidden="true" />
        </>
      )}
    </Button>
  );
}

export function SignInForm({ configured }: { configured: boolean }) {
  const initialState: SignInState = null;
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-fg">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder="you@example.com"
          required
          disabled={!configured}
          aria-invalid={state ? true : undefined}
          aria-describedby={state ? "sign-in-error" : "email-hint"}
        />
        <p id="email-hint" className="text-xs text-fg-subtle">
          Use the private owner account configured for this workspace.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-fg">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!configured}
          aria-invalid={state ? true : undefined}
          aria-describedby={state ? "sign-in-error" : undefined}
        />
      </div>

      {state ? (
        <div id="sign-in-error" role="alert" className="flex gap-3 rounded-md border border-danger/35 bg-danger-soft p-3 text-sm text-danger">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <SubmitButton configured={configured} />
    </form>
  );
}
