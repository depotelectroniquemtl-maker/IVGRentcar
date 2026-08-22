import { type ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "outline" | "whatsapp" | "dark";

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-ink text-ink hover:bg-ink hover:text-white",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1DA851]",
  dark: "bg-ink text-white hover:bg-black",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  href,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
    <Link
      href={href}
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function ExternalButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"a"> & { variant?: Variant }) {
  return (
    <a
      className={`${base} ${variantClasses[variant]} ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
}
