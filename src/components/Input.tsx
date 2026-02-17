import { cn } from "@/lib/utils";
import { Input as UiInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  type?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <UiInput
        id={inputId}
        className={cn(error && "border-destructive")}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
