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
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-sm">
      {children}
      <SubmitButton>{submitLabel}</SubmitButton>
      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
