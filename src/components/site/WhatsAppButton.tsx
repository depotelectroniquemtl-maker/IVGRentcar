import { useTranslations } from "next-intl";
import { ExternalButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
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
      <WhatsAppIcon className="h-5 w-5" />
      {t("cta_whatsapp")}
    </ExternalButtonLink>
  );
}
