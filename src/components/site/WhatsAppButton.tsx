import { useTranslations } from "next-intl";
import { ExternalButtonLink } from "@/components/ui/Button";
import { whatsappUrl } from "@/lib/constants";

export function WhatsAppButton({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  const t = useTranslations("home.hero");

  return (
    <ExternalButtonLink
      href={whatsappUrl(message)}
      variant="whatsapp"
      className={className}
    >
      {t("cta_whatsapp")}
    </ExternalButtonLink>
  );
}
