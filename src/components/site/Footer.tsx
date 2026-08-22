import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("site");

  return (
    <footer className="mt-16 border-t border-black/10 bg-ink text-white">
      <Container className="flex flex-col gap-2 py-8 text-sm">
        <p className="font-bold">
          <span className="text-brand">I.V.J</span> Polanco Rent a Car
        </p>
        <p className="text-white/70">{t("footer.address")}</p>
        <p className="text-white/70">WhatsApp: +{WHATSAPP_NUMBER}</p>
        <p className="mt-4 text-xs text-white/50">
          © {new Date().getFullYear()} I.V.J Polanco Rent a Car — {t("footer.rights")}
        </p>
      </Container>
    </footer>
  );
}
