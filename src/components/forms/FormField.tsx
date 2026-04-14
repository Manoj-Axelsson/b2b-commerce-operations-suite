
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
  return (
    <div className="w-full">
      <Label htmlFor={label.toLowerCase()} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={label.toLowerCase()}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2"
        required={required}
      />
      {error ? <p className="text-sm text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}
