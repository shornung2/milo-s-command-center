import { cn } from "@/lib/utils";
import { Textarea as UiTextarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <UiTextarea
        id={textareaId}
        className={cn(error && "border-destructive")}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
