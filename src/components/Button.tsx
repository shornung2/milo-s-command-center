import { cn } from "@/lib/utils";
import { Button as UiButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantMap: Record<ButtonVariant, "default" | "secondary" | "destructive"> = {
  primary: "default",
  secondary: "secondary",
  danger: "destructive",
};

const sizeMap: Record<ButtonSize, "sm" | "default" | "lg"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <UiButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </UiButton>
  );
}
