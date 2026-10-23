"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type Values = z.infer<typeof schema>;

/** Footer newsletter signup. Demo-only — validates and confirms with a toast,
 *  no request is sent. */
export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async () => {
    // Simulated subscribe — swap for a real endpoint when wiring a provider.
    await new Promise((r) => setTimeout(r, 400));
    toast.success("You're on the list. Welcome to VINTATE.");
    reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 max-w-sm">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email"
          aria-label="Email address"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "newsletter-error" : undefined}
          className="flex-1 rounded-none"
          {...register("email")}
        />
        <Button
          type="submit"
          size="sm"
          className="rounded-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? "…" : "Subscribe"}
        </Button>
      </div>
      {errors.email && (
        <p
          id="newsletter-error"
          role="alert"
          className="mt-1.5 text-xs text-destructive"
        >
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
