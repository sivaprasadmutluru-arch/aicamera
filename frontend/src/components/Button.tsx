import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white",
  secondary: "bg-ink-700 hover:bg-ink-800 dark:bg-ink-600 dark:hover:bg-ink-500 text-white",
  danger: "bg-white dark:bg-ink-800 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
  ghost: "bg-transparent text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
