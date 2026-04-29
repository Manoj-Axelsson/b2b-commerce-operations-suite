import { ReactNode } from "react";
import { SubmitButton } from "./SubmitButton";

interface AuthFormProps {
  children: ReactNode;
  onSubmit: (event: React.FormEvent) => void;
  submitLabel: string;
  error?: string;
}

export function AuthForm({ children, onSubmit, submitLabel, error }: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      // subpixel-antialiased sharpens Garamond's thin strokes on digital screens
      className="w-full max-w-md space-y-6 p-8 bg-white rounded-xl shadow-md subpixel-antialiased"
    >
      {children}
      <SubmitButton>{submitLabel}</SubmitButton>
      {error ? (
        // text-base (up from text-sm) + text-red-700 (up from text-red-600) for legibility
        <p className="text-center text-base font-medium text-red-700">{error}</p>
      ) : null}
    </form>
  );
}
