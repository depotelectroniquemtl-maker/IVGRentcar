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

function MockSidebar({ items, active }: { items: string[]; active: string }) {
  return (
    <div className="flex w-[118px] flex-shrink-0 flex-col justify-between bg-ink text-[9.5px] text-white">
      <div>
        <div className="border-b border-white/10 px-2.5 py-3">
          <b className="text-brand">I.V.J</b> Polanco
        </div>
        <nav className="flex flex-col gap-px p-1.5">
          {items.map((it) => (
            <span
              key={it}
              className={`rounded px-1.5 py-1 ${it === active ? "bg-brand font-semibold text-white" : "text-white/70"}`}
            >
              {it}
            </span>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 px-2.5 py-2 text-[8px] text-white/40">Maria G. · Admin</div>
    </div>
  );
}

export default async function AidePage() {
  const t = await getAdminTranslator("admin.aide");
  const tSidebar = await getAdminTranslator("admin.sidebar");
  const tCommon = await getAdminTranslator("admin.common");
  const tLogin = await getAdminTranslator("admin.login");
  const tDashboard = await getAdminTranslator("admin.dashboard");
  const tDemandes = await getAdminTranslator("admin.demandes");
  const tReservations = await getAdminTranslator("admin.reservations");
  const tCalendrier = await getAdminTranslator("admin.calendrier");
  const tVehicules = await getAdminTranslator("admin.vehicules");
  const tEntretiens = await getAdminTranslator("admin.entretiens");
  const tClients = await getAdminTranslator("admin.clients");
  const tGarantes = await getAdminTranslator("admin.garantes");
  const tTarifs = await getAdminTranslator("admin.tarifs");
  const tUtilisateurs = await getAdminTranslator("admin.utilisateurs");
  const tContrats = await getAdminTranslator("admin.contrats");

  const navItems = [
    tSidebar("nav_panel"), tSidebar("nav_demandes"), tSidebar("nav_reservations"),
    tSidebar("nav_calendrier"), tSidebar("nav_vehicules"), tSidebar("nav_entretiens"),
    tSidebar("nav_clients"), tSidebar("nav_garantes"), tSidebar("nav_tarifs"), tSidebar("nav_utilisateurs"),
  ];

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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/login" />
            <div className="flex min-h-[220px] items-center justify-center bg-[#f2f1ef] p-8">
              <div className="w-[220px] rounded-lg border border-black/10 bg-white p-3">
                <p className="mb-0.5 text-xs font-bold">
                  <span className="text-brand">I.V.J</span> Polanco
                </p>
                <p className="mb-3 text-[8.5px] text-black/50">{tLogin("subtitle")}</p>
                <div className="mb-2">
                  <span className="mb-0.5 block text-[8.5px] text-black/50">{tLogin("email")}</span>
                  <div className="rounded border border-black/15 px-2 py-1 text-[9.5px] text-black/40">nom@ivjpolanco.com</div>
                </div>
                <div className="mb-2">
                  <span className="mb-0.5 block text-[8.5px] text-black/50">{tLogin("password")}</span>
                  <div className="rounded border border-black/15 px-2 py-1 text-[9.5px] text-black/40">••••••••</div>
                </div>
                <div className="mt-1 rounded bg-brand py-1.5 text-center text-[9.5px] font-semibold text-white">{tLogin("submit")}</div>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin" />
            <div className="flex min-h-[220px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_panel")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tSidebar("nav_panel")}</p>
                <div className="mb-2.5 flex gap-2">
                  {[
                    ["7", tDashboard("stat_active_reservations")],
                    ["4", tDashboard("stat_upcoming_reservations")],
                    ["9", tDashboard("stat_available_today")],
                  ].map(([n, l]) => (
                    <div key={l} className="min-w-[86px] rounded-md border border-black/10 bg-white px-2.5 py-1.5">
                      <div className="text-sm font-bold">{n}</div>
                      <div className="text-[7.5px] uppercase text-black/45">{l}</div>
                    </div>
                  ))}
                </div>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9.5px]">
                  <tbody>
                    <tr><td className="px-2 py-1">Suzuki XL 7 — J. Fernández</td><td className="px-2 py-1 text-right"><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">{tDashboard("retorno_en_retraso", { n: 1 })}</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Kia Seltos — R. Martin</td><td className="border-t border-black/5 px-2 py-1 text-right"><span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-800">{tDashboard("retorno_hoy")}</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/demandes" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_demandes")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tSidebar("nav_demandes")}</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">{tDemandes("col_nombre")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tDemandes("col_vehiculo")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tDemandes("col_estado")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Sofia Reyes</td><td className="border-t border-black/5 px-2 py-1">Kia Seltos</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">{tDemandes("statut_nouvelle")}</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Marc Dubois</td><td className="border-t border-black/5 px-2 py-1">Pasola 175cc</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">{tDemandes("statut_contactee")}</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Elena Ruiz</td><td className="border-t border-black/5 px-2 py-1">Changan</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">{tDemandes("statut_convertie")}</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/calendrier" />
            <div className="flex min-h-[220px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_calendrier")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tCalendrier("title")}</p>
                <div className="relative overflow-hidden rounded-md border border-black/10 bg-white">
                  <div className="flex gap-3 border-b border-black/5 px-2.5 py-1.5 text-[8.5px] text-black/50">
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-blue-100 align-[-1px]" />{tCalendrier("legend_reservation")}</span>
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-orange-100 align-[-1px]" />{tCalendrier("legend_indisponibilite")}</span>
                  </div>
                  <div className="grid grid-cols-[64px_repeat(7,1fr)]">
                    <div className="border-b border-black/5 bg-black/[0.03] px-1 py-1 text-center text-[8px] text-black/50">{tCalendrier("col_vehiculo")}</div>
                    {["24","25","26","27","28","29","30"].map((d) => (
                      <div key={d} className="border-b border-black/5 bg-black/[0.03] px-1 py-1 text-center text-[8px] text-black/50">{d}</div>
                    ))}
                    <div className="border-t border-black/5 px-2 py-1.5 text-[8.5px]">Changan</div>
                    <div className="relative h-[22px] border-l border-t border-black/5" />
                    <div className="relative h-[22px] border-l border-t border-black/5 bg-brand/10 outline outline-1 outline-dashed outline-brand -outline-offset-1" />
                    <div className="relative h-[22px] border-l border-t border-black/5 bg-brand/10 outline outline-1 outline-dashed outline-brand -outline-offset-1" />
                    <div className="relative h-[22px] border-l border-t border-black/5 bg-brand/10 outline outline-1 outline-dashed outline-brand -outline-offset-1" />
                    <div className="relative h-[22px] border-l border-t border-black/5" />
                    <div className="relative h-[22px] border-l border-t border-black/5" />
                    <div className="relative h-[22px] border-l border-t border-black/5" />
                  </div>
                  <span className="pointer-events-none absolute text-sm" style={{ left: 168, top: 96 }}>🖱️</span>
                  <span className="pointer-events-none absolute rounded bg-ink px-1.5 py-0.5 font-mono text-[8px] text-white" style={{ left: 60, top: 78 }}>
                    {t("c04_drag_hint")}
                  </span>
                </div>
              </div>
            </div>
          </figure>
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
          <figure className="mb-6 max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/vehicules" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_vehicules")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tSidebar("nav_vehicules")}</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">{tVehicules("col_categoria")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tVehicules("col_placa")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tVehicules("col_estado")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Kia Seltos 2026</td><td className="border-t border-black/5 px-2 py-1">A123456</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">{tCommon("vehicule_etat_disponible")}</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Tucson 4x4</td><td className="border-t border-black/5 px-2 py-1">A778812</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-800">{tCommon("vehicule_etat_maintenance")}</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>

          <p className="mb-3 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c05_retrait_note", { b })}</p>
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/vehicules/quad-04" />
            <div className="flex min-h-[220px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_vehicules")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tVehicules("edit_title", { plaque: "Q-0412" })}</p>
                <label className="mb-2 flex items-center gap-1.5 text-[9.5px]">
                  <span className="flex h-3 w-3 items-center justify-center rounded-sm border border-black/25 bg-white" />
                  <span className="font-medium">{tVehicules("field_activo")}</span>
                </label>
                <div className="mb-2">
                  <span className="mb-0.5 block text-[8.5px] text-black/50">{tVehicules("field_raison_retrait")}</span>
                  <div className="rounded border border-black/15 bg-white px-2 py-1.5 text-[9.5px] text-black/60">Vendu le 12/03/2026 à un client local</div>
                </div>
                <div className="mt-2.5 flex justify-end border-t border-black/10 pt-2.5">
                  <span className="text-[9.5px] font-semibold text-red-600">{tVehicules("delete")}</span>
                </div>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/entretiens" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_entretiens")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tSidebar("nav_entretiens")}</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">{tEntretiens("col_vehiculo")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tEntretiens("col_tipo")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tEntretiens("col_proximo")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Tucson 4x4</td><td className="border-t border-black/5 px-2 py-1">{tCommon("entretien_type_vidange")}</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">{tEntretiens("vencido")}</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Kia Seltos</td><td className="border-t border-black/5 px-2 py-1">{tCommon("entretien_type_pneus")}</td><td className="border-t border-black/5 px-2 py-1">15 janv.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/clients" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_clients")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tSidebar("nav_clients")}</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">{tClients("col_nombre")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tClients("col_telefono")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tClients("col_licencia")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Julián Fernández</td><td className="border-t border-black/5 px-2 py-1">809 555 0142</td><td className="border-t border-black/5 px-2 py-1">D4471982</td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Léa Duval</td><td className="border-t border-black/5 px-2 py-1">+33 6 12 34 56</td><td className="border-t border-black/5 px-2 py-1">091827364</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/garantes" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_garantes")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tSidebar("nav_garantes")}</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">{tGarantes("col_nombre")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tGarantes("col_telefono")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tGarantes("col_cedula")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Isabel Polanco</td><td className="border-t border-black/5 px-2 py-1">809 555 0100</td><td className="border-t border-black/5 px-2 py-1">001-1234567-8</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/tarifs" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_tarifs")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tSidebar("nav_tarifs")}</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">{tTarifs("col_categoria")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tTarifs("col_1_3")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tTarifs("col_4_plus")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tTarifs("col_activo")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Kia Seltos 2026</td><td className="border-t border-black/5 px-2 py-1">80 $</td><td className="border-t border-black/5 px-2 py-1">72 $</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8.5px] font-semibold text-emerald-700">{tTarifs("col_activo_yes")}</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Hyundai</td><td className="border-t border-black/5 px-2 py-1">55 $</td><td className="border-t border-black/5 px-2 py-1">50 $</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-black/10 px-2 py-0.5 text-[8.5px] font-semibold text-ink-soft">{tTarifs("col_activo_no")}</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/utilisateurs" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_utilisateurs")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tSidebar("nav_utilisateurs")}</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">{tUtilisateurs("col_nombre")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tUtilisateurs("col_rol")}</th>
                      <th className="px-2 py-1 text-left font-semibold">{tCommon("edit")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Maria G.</td><td className="border-t border-black/5 px-2 py-1">{tCommon("role_admin")}</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">{t("c10_mock_actif")}</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Ana T.</td><td className="border-t border-black/5 px-2 py-1">{tCommon("role_employe")}</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">{tUtilisateurs("estado_desactivado")}</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
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
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/reservations/0144/contrat/editar" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <MockSidebar items={navItems} active={tSidebar("nav_reservations")} />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">{tContrats("title")}</p>
                <div className="mb-2 grid grid-cols-3 gap-2">
                  <div><span className="mb-0.5 block text-[8.5px] text-black/50">{tContrats("field_hora_entrega")}</span><div className="rounded border border-black/15 bg-white px-2 py-1 text-[9.5px]">14:30</div></div>
                  <div><span className="mb-0.5 block text-[8.5px] text-black/50">{tContrats("field_color_vehiculo")}</span><div className="rounded border border-black/15 bg-white px-2 py-1 text-[9.5px]">Blanc</div></div>
                  <div><span className="mb-0.5 block text-[8.5px] text-black/50">{tContrats("field_nivel_gasolina")}</span><div className="rounded border border-black/15 bg-white px-2 py-1 text-[9.5px]">3/4</div></div>
                </div>
                <span className="mb-0.5 block text-[8.5px] text-black/50">{tContrats("field_garante_guardado")}</span>
                <div className="mb-2 rounded border border-black/15 bg-white px-2 py-1 text-[9.5px]">Isabel Polanco</div>
                <span className="mb-1 block text-[8.5px] text-black/50">{tContrats("section_accesorios")}</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded bg-ink px-1.5 py-0.5 text-[8px] text-white">A/C</span>
                  <span className="rounded bg-ink px-1.5 py-0.5 text-[8px] text-white">•</span>
                  <span className="rounded bg-black/5 px-1.5 py-0.5 text-[8px] text-black/60">•</span>
                </div>
              </div>
            </div>
          </figure>

          <p className="my-5 max-w-[62ch] text-[15px] text-ink-soft">{t.rich("c11_signature_note", { b })}</p>
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/reservations/0144/contrat/firmar" />
            <div className="flex min-h-[220px] items-center justify-center bg-[#f2f1ef] p-6">
              <div className="w-[240px] rounded-lg border border-black/10 bg-white p-3">
                <p className="mb-2 text-[11px] font-bold">{tContrats("firma_title")}</p>
                <div className="mb-1.5"><span className="mb-0.5 block text-[8.5px] text-black/50">{tReservations("field_cliente")}</span><div className="rounded border border-black/15 px-2 py-1 text-[9.5px]">Léa Duval</div></div>
                <div className="mb-1.5"><span className="mb-0.5 block text-[8.5px] text-black/50">{tReservations("field_vehiculo")}</span><div className="rounded border border-black/15 px-2 py-1 text-[9.5px]">Tucson 4x4</div></div>
                <div className="mb-2 flex h-[54px] items-center justify-center rounded border border-dashed border-black/20 bg-[#fdfdfc]">
                  <svg width="120" height="30" viewBox="0 0 140 34" fill="none">
                    <path d="M4 26 C 14 6, 22 6, 28 20 C 34 32, 40 12, 48 14 C 58 17, 60 28, 72 18 C 82 10, 88 24, 100 16 C 110 10, 116 22, 128 12"
                      stroke="#18140F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1 rounded border border-black/15 py-1 text-center text-[9.5px] font-semibold">{tContrats("firma_clear")}</div>
                  <div className="flex-1 rounded bg-brand py-1 text-center text-[9.5px] font-semibold text-white">{tContrats("firma_confirm")}</div>
                </div>
              </div>
            </div>
          </figure>
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
