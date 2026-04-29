
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function FormField({ label, type, value, onChange, error, required }: FormFieldProps) {
  // Use label text as id — consistent with the existing pattern
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {/* text-base (up from text-sm) + font-medium + text-slate-950 for max Garamond legibility */}
      <Label htmlFor={fieldId} className="text-base font-medium text-slate-950">
        {label}
      </Label>
      <Input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 text-base text-slate-950 placeholder:text-slate-400"
        required={required}
      />
      {error ? (
        // text-base (up from text-sm) + text-red-700 for high-contrast error state
        <p className="text-base font-medium text-red-700 mt-1">{error}</p>
      ) : null}
    </div>
  );
}
