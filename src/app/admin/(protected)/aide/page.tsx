import type { ReactNode } from "react";
import Image from "next/image";
import { getAdminTranslator } from "@/lib/admin-i18n";
import { AideTabs } from "@/components/admin/AideTabs";

const b = (chunks: ReactNode) => <b>{chunks}</b>;

function ChapterHead({ n, title, badge }: { n: string; title: string; badge?: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-3">
      <span className="font-mono text-sm font-semibold text-brand">{n}</span>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {badge && (
        <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-dark">
          {badge}
        </span>
      )}
    </div>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mb-6 flex max-w-[62ch] flex-col gap-2.5">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink">
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-black/15 font-mono text-[11px] font-semibold text-brand">
            {i + 1}
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  );
}

function Callout({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "warn" | "tip" }) {
  const border = tone === "warn" ? "border-l-amber-600" : tone === "tip" ? "border-l-emerald-700" : "border-l-brand";
  return (
    <div className={`mb-6 max-w-[62ch] rounded-md border border-black/10 border-l-[3px] ${border} bg-black/[0.02] px-4 py-3 text-sm text-ink-soft`}>
      {children}
    </div>
  );
}

function FrameBar({ url }: { url: string }) {
  return (
    <div className="flex h-8 items-center gap-2.5 bg-[#232221] px-3">
      <span className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#E4564A]" />
        <span className="h-2 w-2 rounded-full bg-[#E0A63C]" />
        <span className="h-2 w-2 rounded-full bg-[#4CA65B]" />
      </span>
      <span className="flex-1 truncate rounded bg-white/[0.06] px-2.5 py-0.5 font-mono text-[10.5px] text-[#C9C4BC]">
        {url}
      </span>
    </div>
  );
}

// Vraie capture d'ecran (pas une reconstitution) — plus large que les maquettes dessinees
// (560px) pour rester lisible a cette resolution native (1280x800).
function RealScreenshot({ url, src, alt }: { url: string; src: string; alt: string }) {
  return (
    <figure className="mb-6 max-w-[820px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
      <FrameBar url={url} />
      <Image src={src} alt={alt} width={1280} height={800} className="block h-auto w-full" />
    </figure>
  );
}

export default async function AidePage() {
  const t = await getAdminTranslator("admin.aide");
  const tSidebar = await getAdminTranslator("admin.sidebar");

  const chapters = [
    {
      id: "connexion",
      n: "00",
      navLabel: t("title_connexion"),
      content: (
        <>
          <ChapterHead n="00" title={t("title_connexion")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c00_intro")}</p>
          <Steps items={[t.rich("c00_step1", { b }), t("c00_step2"), t.rich("c00_step3", { b })]} />
          <RealScreenshot url="ivjrentcar.com/admin/login" src="/aide/00-login.png" alt="Écran de connexion" />
        </>
      ),
    },
    {
      id: "dashboard",
      n: "01",
      navLabel: tSidebar("nav_panel"),
      content: (
        <>
          <ChapterHead n="01" title={tSidebar("nav_panel")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c01_intro")}</p>
          <Steps items={[t("c01_step1"), t.rich("c01_step2", { b }), t.rich("c01_step3", { b })]} />
          <RealScreenshot url="ivjrentcar.com/admin" src="/aide/01-dashboard.png" alt="Tableau de bord" />
        </>
      ),
    },
    {
      id: "demandes",
      n: "02",
      navLabel: tSidebar("nav_demandes"),
      content: (
        <>
          <ChapterHead n="02" title={tSidebar("nav_demandes")} badge={t("c02_badge")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c02_intro", { b })}</p>
          <Steps items={[t.rich("c02_step1", { b }), t.rich("c02_step2", { b }), t.rich("c02_step3", { b })]} />
          <RealScreenshot url="ivjrentcar.com/admin/demandes" src="/aide/02-demandes.png" alt="Liste des demandes" />
        </>
      ),
    },
    {
      id: "reservations",
      n: "03",
      navLabel: tSidebar("nav_reservations"),
      content: (
        <>
          <ChapterHead n="03" title={tSidebar("nav_reservations")} badge={t("c03_badge")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c03_intro")}</p>
          <Steps
            items={[
              t.rich("c03_step1", { b }),
              t("c03_step2"),
              t.rich("c03_step3", { b }),
              t.rich("c03_step4", { b }),
            ]}
          />
          <Callout tone="tip">{t.rich("c03_exemple_intro", { b })}</Callout>

          <div className="mb-6 max-w-[820px] overflow-hidden rounded-xl border border-black/10 bg-black shadow-sm">
            <video controls preload="metadata" className="block w-full">
              <source src="/aide/reservation-demo.webm" type="video/webm" />
            </video>
          </div>
          <p className="mb-6 max-w-[62ch] text-xs text-ink-soft">{t("c03_video_caption")}</p>

          <p className="mb-3 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c03_creer_note", { b })}</p>
          <RealScreenshot
            url="ivjrentcar.com/admin/reservations/nueva"
            src="/aide/03-formulaire-rempli.png"
            alt="Formulaire de nouvelle réservation rempli"
          />

          <p className="mb-3 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c03_suivi_note", { b })}</p>
          <RealScreenshot
            url="ivjrentcar.com/admin/reservations"
            src="/aide/04-liste-avec-reservation.png"
            alt="Liste des réservations avec la nouvelle réservation"
          />

          <p className="mb-3 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c03_finaliser_note", { b })}</p>
          <RealScreenshot
            url="ivjrentcar.com/admin/reservations/35"
            src="/aide/05-fiche-reservation-actions.png"
            alt="Fiche réservation avec la barre d'actions"
          />

          <p className="mb-3 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c03_rendu_note", { b })}</p>
          <RealScreenshot
            url="ivjrentcar.com/admin/reservations/35"
            src="/aide/06-fiche-reservation-rendu.png"
            alt="Fiche réservation marquée comme rendue"
          />
        </>
      ),
    },
    {
      id: "calendrier",
      n: "04",
      navLabel: tSidebar("nav_calendrier"),
      content: (
        <>
          <ChapterHead n="04" title={tSidebar("nav_calendrier")} badge={t("c04_badge")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c04_intro")}</p>
          <Steps items={[t.rich("c04_step1", { b }), t.rich("c04_step2", { b }), t.rich("c04_step3", { b }), t("c04_step4")]} />
          <RealScreenshot url="ivjrentcar.com/admin/calendrier" src="/aide/04-calendrier.png" alt="Calendrier de la flotte" />
        </>
      ),
    },
    {
      id: "vehicules",
      n: "05",
      navLabel: tSidebar("nav_vehicules"),
      content: (
        <>
          <ChapterHead n="05" title={tSidebar("nav_vehicules")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c05_intro")}</p>
          <Steps
            items={[
              t.rich("c05_step1", { b }),
              t.rich("c05_step2", { b }),
              t.rich("c05_step3", { b }),
              t.rich("c05_step4", { b }),
              t.rich("c05_step5", { b }),
            ]}
          />
          <RealScreenshot url="ivjrentcar.com/admin/vehicules" src="/aide/05a-vehicules-liste.png" alt="Liste des véhicules" />

          <p className="mb-3 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c05_retrait_note", { b })}</p>
          <RealScreenshot
            url="ivjrentcar.com/admin/vehicules/quad-08"
            src="/aide/05b-vehicule-retrait.png"
            alt="Fiche véhicule désactivée avec motif du retrait"
          />
        </>
      ),
    },
    {
      id: "entretien",
      n: "06",
      navLabel: tSidebar("nav_entretiens"),
      content: (
        <>
          <ChapterHead n="06" title={tSidebar("nav_entretiens")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c06_intro")}</p>
          <Steps items={[t.rich("c06_step1", { b }), t.rich("c06_step2", { b }), t("c06_step3")]} />
          <RealScreenshot url="ivjrentcar.com/admin/entretiens/voitures" src="/aide/06-entretien.png" alt="Liste des entretiens" />
        </>
      ),
    },
    {
      id: "clients",
      n: "07",
      navLabel: tSidebar("nav_clients"),
      content: (
        <>
          <ChapterHead n="07" title={tSidebar("nav_clients")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c07_intro")}</p>
          <Steps items={[t("c07_step1"), t.rich("c07_step2", { b }), t.rich("c07_step3", { b })]} />
          <Callout tone="warn">{t.rich("c07_callout", { b })}</Callout>
          <RealScreenshot url="ivjrentcar.com/admin/clients" src="/aide/07-clients.png" alt="Liste des clients" />
        </>
      ),
    },
    {
      id: "garants",
      n: "08",
      navLabel: tSidebar("nav_garantes"),
      content: (
        <>
          <ChapterHead n="08" title={tSidebar("nav_garantes")} badge={t("c08_badge")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c08_intro")}</p>
          <Steps items={[t("c08_step1"), t.rich("c08_step2", { b })]} />
          <Callout tone="tip">{t.rich("c08_callout", { b })}</Callout>
          <RealScreenshot url="ivjrentcar.com/admin/garantes" src="/aide/08-garants.png" alt="Liste des garants" />
        </>
      ),
    },
    {
      id: "tarifs",
      n: "09",
      navLabel: tSidebar("nav_tarifs"),
      content: (
        <>
          <ChapterHead n="09" title={tSidebar("nav_tarifs")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c09_intro")}</p>
          <Steps items={[t.rich("c09_step1", { b }), t.rich("c09_step2", { b }), t.rich("c09_step3", { b })]} />
          <RealScreenshot url="ivjrentcar.com/admin/tarifs" src="/aide/09-tarifs.png" alt="Grille tarifaire" />
        </>
      ),
    },
    {
      id: "utilisateurs",
      n: "10",
      navLabel: tSidebar("nav_utilisateurs"),
      content: (
        <>
          <ChapterHead n="10" title={tSidebar("nav_utilisateurs")} badge={t("c10_badge")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t("c10_intro")}</p>
          <Steps items={[t.rich("c10_step1", { b }), t.rich("c10_step2", { b })]} />
          <Callout>{t("c10_callout")}</Callout>
          <RealScreenshot url="ivjrentcar.com/admin/utilisateurs" src="/aide/10-utilisateurs.png" alt="Liste des utilisateurs" />
        </>
      ),
    },
    {
      id: "contrat",
      n: "11",
      navLabel: t("title_contrat"),
      content: (
        <>
          <ChapterHead n="11" title={t("title_contrat")} />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c11_intro", { b })}</p>
          <Steps items={[t("c11_step1"), t("c11_step2"), t.rich("c11_step3", { b })]} />
          <RealScreenshot
            url="ivjrentcar.com/admin/reservations/9001/contrat/editar"
            src="/aide/11a-contrat-formulaire.png"
            alt="Formulaire de finalisation du contrat"
          />

          <p className="my-5 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c11_signature_note", { b })}</p>
          <RealScreenshot
            url="ivjrentcar.com/admin/reservations/9001/contrat/firmar"
            src="/aide/11b-contrat-signature.png"
            alt="Écran de signature du contrat"
          />
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t("page_title")}</h1>
        <p className="mt-1 max-w-[62ch] text-sm text-ink-soft">{t("page_subtitle")}</p>
      </div>
      <AideTabs chapters={chapters} />
    </div>
  );
}
