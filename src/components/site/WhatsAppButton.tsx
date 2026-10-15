import { useTranslations } from "next-intl";
import { ExternalButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { whatsappUrl } from "@/lib/constants";

// `location` alimente l'événement GA4 « whatsapp_click » (emplacement du bouton).
export function WhatsAppButton({
  message,
  className,
  location = "hero",
}: {
  message?: string;
  className?: string;
  location?: string;
}) {
  const t = useTranslations("home.hero");

  return (
    <ExternalButtonLink
      href={whatsappUrl(message)}
      variant="whatsapp"
      className={className}
      data-wa-location={location}
    >
      <WhatsAppIcon className="h-5 w-5" />
      {t("cta_whatsapp")}
    </ExternalButtonLink>
  );
}
