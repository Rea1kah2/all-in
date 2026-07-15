import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm text-ink">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-bear">{error}</p> : null}
    </div>
  );
}
