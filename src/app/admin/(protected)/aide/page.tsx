// Guide interne en français (pour l'instant) — contenu volontairement en dur plutôt que
// dans messages/*.json : ce n'est pas une chaîne d'interface courte à traduire mot à mot,
// mais un long texte éditorial. Une traduction es/en viendra si elle est demandée.
import Link from "next/link";

const chapters = [
  { id: "connexion", n: "00", title: "Connexion" },
  { id: "dashboard", n: "01", title: "Tableau de bord" },
  { id: "demandes", n: "02", title: "Demandes" },
  { id: "reservations", n: "03", title: "Réservations" },
  { id: "calendrier", n: "04", title: "Calendrier" },
  { id: "vehicules", n: "05", title: "Véhicules" },
  { id: "entretien", n: "06", title: "Entretien" },
  { id: "clients", n: "07", title: "Clients" },
  { id: "garants", n: "08", title: "Garants" },
  { id: "tarifs", n: "09", title: "Tarifs" },
  { id: "utilisateurs", n: "10", title: "Utilisateurs" },
  { id: "contrat", n: "11", title: "Contrat & signature" },
];

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

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="mb-6 flex max-w-[62ch] flex-col gap-2.5">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink">
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-black/15 font-mono text-[11px] font-semibold text-brand">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: text }} />
        </li>
      ))}
    </ol>
  );
}

function Callout({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "warn" | "tip" }) {
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

function Sidebar({ active }: { active: string }) {
  const items = [
    "Tableau de bord", "Demandes", "Réservations", "Calendrier", "Véhicules",
    "Entretien", "Clients", "Garants", "Tarifs", "Utilisateurs",
  ];
  return (
    <div className="flex w-[118px] flex-shrink-0 flex-col justify-between bg-ink text-[9.5px] text-white">
      <div>
        <div className="border-b border-white/10 px-2.5 py-3">
          <b className="text-brand">I.V.J</b> Polanco
          <div className="mt-0.5 text-[8px] text-white/40">Panneau interne</div>
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

export default function AidePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Guide du panneau IVJ</h1>
        <p className="mt-1 max-w-[62ch] text-sm text-ink-soft">
          Mode d&apos;emploi du panneau interne, avec une maquette pour chaque écran. Rédigé en français pour
          l&apos;instant — les libellés que vous voyez dans le panneau sont exactement ceux utilisés ici.
        </p>
      </div>

      <nav className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border border-black/10 bg-white px-4 py-3 text-[13px]">
        {chapters.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="text-ink-soft hover:text-brand hover:underline">
            <span className="mr-1 font-mono text-[11px] text-black/30">{c.n}</span>
            {c.title}
          </a>
        ))}
      </nav>

      <div className="flex flex-col">
        {/* 00 CONNEXION */}
        <section id="connexion" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="00" title="Connexion" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            Le panneau interne est séparé du site public. Chaque membre de l&apos;équipe se connecte avec son propre
            e-mail et mot de passe, créés par un administrateur (voir la section Utilisateurs).
          </p>
          <Steps
            items={[
              "Depuis le site public, ouvrez le lien <b>Admin</b> tout en bas du pied de page — ou allez directement sur <b>/admin/login</b>.",
              "Saisissez l'e-mail et le mot de passe fournis par un administrateur.",
              "Le rôle du compte détermine l'accès : <b>Admin</b> voit tout, y compris Utilisateurs et les suppressions définitives ; <b>Employé</b> gère les opérations quotidiennes sans ces deux droits.",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/login" />
            <div className="flex min-h-[220px] items-center justify-center bg-[#f2f1ef] p-8">
              <div className="w-[220px] rounded-lg border border-black/10 bg-white p-3">
                <p className="mb-0.5 text-xs font-bold">
                  <span className="text-brand">I.V.J</span> Polanco
                </p>
                <p className="mb-3 text-[8.5px] text-black/50">Panneau interne — connexion</p>
                <div className="mb-2">
                  <span className="mb-0.5 block text-[8.5px] text-black/50">E-mail</span>
                  <div className="rounded border border-black/15 px-2 py-1 text-[9.5px] text-black/40">nom@ivjpolanco.com</div>
                </div>
                <div className="mb-2">
                  <span className="mb-0.5 block text-[8.5px] text-black/50">Mot de passe</span>
                  <div className="rounded border border-black/15 px-2 py-1 text-[9.5px] text-black/40">••••••••</div>
                </div>
                <div className="mt-1 rounded bg-brand py-1.5 text-center text-[9.5px] font-semibold text-white">Se connecter</div>
              </div>
            </div>
          </figure>
        </section>

        {/* 01 DASHBOARD */}
        <section id="dashboard" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="01" title="Tableau de bord" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            L&apos;écran d&apos;accueil après connexion : l&apos;activité en cours et les retours de véhicules à
            surveiller, sans avoir à ouvrir chaque section.
          </p>
          <Steps
            items={[
              "Les trois compteurs en haut résument les réservations en cours, les réservations à venir et les véhicules disponibles aujourd'hui.",
              "Les boutons <b>Actions rapides</b> ouvrent directement une nouvelle réservation ou un nouveau client.",
              "La liste <b>Retours</b> signale les véhicules à récupérer, avec un repère <b>En retard</b> si la date de retour est dépassée.",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin" />
            <div className="flex min-h-[220px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Tableau de bord" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Tableau de bord</p>
                <div className="mb-2.5 flex gap-2">
                  {[["7", "RÉSERVATIONS EN COURS"], ["4", "À VENIR"], ["9", "DISPONIBLES AUJOURD'HUI"]].map(([n, l]) => (
                    <div key={l} className="min-w-[86px] rounded-md border border-black/10 bg-white px-2.5 py-1.5">
                      <div className="text-sm font-bold">{n}</div>
                      <div className="text-[7.5px] text-black/45">{l}</div>
                    </div>
                  ))}
                </div>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9.5px]">
                  <tbody>
                    <tr><td className="px-2 py-1">Suzuki XL 7 — J. Fernández</td><td className="px-2 py-1 text-right"><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">En retard 1j</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Kia Seltos — R. Martin</td><td className="border-t border-black/5 px-2 py-1 text-right"><span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-800">Aujourd&apos;hui</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
        </section>

        {/* 02 DEMANDES */}
        <section id="demandes" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="02" title="Demandes" badge="Depuis le site public" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            Chaque demande envoyée par un visiteur depuis le formulaire public <b>/reservar</b> arrive
            automatiquement ici, avant de devenir une réservation confirmée.
          </p>
          <Steps
            items={[
              "Une nouvelle demande porte le statut <b>Nouvelle</b> ; marquez-la <b>Contactée</b> dès que vous avez répondu au client par WhatsApp.",
              "Cliquez <b>Convertir en réservation</b> pour créer la réservation : véhicule, dates et coordonnées du client sont déjà préremplis.",
              "Une demande sans suite peut être classée <b>Rejetée</b> pour la sortir de la liste active.",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/demandes" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Demandes" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Demandes</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">Nom</th>
                      <th className="px-2 py-1 text-left font-semibold">Véhicule</th>
                      <th className="px-2 py-1 text-left font-semibold">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Sofia Reyes</td><td className="border-t border-black/5 px-2 py-1">Kia Seltos</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">Nouvelle</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Marc Dubois</td><td className="border-t border-black/5 px-2 py-1">Pasola 175cc</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">Contactée</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Elena Ruiz</td><td className="border-t border-black/5 px-2 py-1">Changan</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">Convertie</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
        </section>

        {/* 03 RESERVATIONS */}
        <section id="reservations" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="03" title="Réservations" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            La liste complète des locations, avec recherche instantanée et pagination. Chaque ligne affiche une
            phase calculée automatiquement à partir des dates : <b>À venir</b>, <b>En cours</b>, <b>Terminée</b>,
            <b> En retard</b> ou <b>Annulée</b>.
          </p>
          <Steps
            items={[
              "La barre de recherche filtre par numéro, client ou véhicule au fil de la frappe.",
              "<b>Nouvelle réservation</b> ouvre le formulaire : client, véhicule, dates, prix calculé automatiquement (modifiable).",
              "Depuis la fiche : <b>Marquer comme rendu</b> à la restitution, ou <b>Supprimer</b> pour annuler définitivement (irréversible).",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/reservations" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Réservations" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Réservations</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">N°</th>
                      <th className="px-2 py-1 text-left font-semibold">Client</th>
                      <th className="px-2 py-1 text-left font-semibold">Véhicule</th>
                      <th className="px-2 py-1 text-left font-semibold">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">0142</td><td className="border-t border-black/5 px-2 py-1">J. Fernández</td><td className="border-t border-black/5 px-2 py-1">Suzuki XL 7</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">En retard</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">0143</td><td className="border-t border-black/5 px-2 py-1">R. Martin</td><td className="border-t border-black/5 px-2 py-1">Kia Seltos</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">En cours</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
        </section>

        {/* 04 CALENDRIER */}
        <section id="calendrier" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="04" title="Calendrier" badge="Sélection à la souris" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            Vue de toute la flotte sur 14 jours. Une case bleue est une réservation, une case orange est un
            blocage manuel.
          </p>
          <Steps
            items={[
              "Un <b>clic simple</b> sur une case vide propose de créer une réservation ou un blocage pour ce jour.",
              "<b>Cliquez-glissez</b> horizontalement sur la ligne d'un véhicule pour sélectionner plusieurs jours d'un coup.",
              "Au relâchement, l'écran de choix s'ouvre avec la <b>plage complète déjà préremplie</b>.",
              "Cliquer sur une case déjà occupée ouvre directement la réservation ou le blocage correspondant.",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/calendrier" />
            <div className="flex min-h-[220px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Calendrier" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Calendrier de la flotte</p>
                <div className="relative overflow-hidden rounded-md border border-black/10 bg-white">
                  <div className="flex gap-3 border-b border-black/5 px-2.5 py-1.5 text-[8.5px] text-black/50">
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-blue-100 align-[-1px]" />Réservation</span>
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-orange-100 align-[-1px]" />Blocage</span>
                  </div>
                  <div className="grid grid-cols-[64px_repeat(7,1fr)]">
                    <div className="border-b border-black/5 bg-black/[0.03] px-1 py-1 text-center text-[8px] text-black/50">Véhicule</div>
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
                  <span className="pointer-events-none absolute rounded bg-ink px-1.5 py-0.5 font-mono text-[8px] text-white" style={{ left: 70, top: 78 }}>
                    glisser-déposer →
                  </span>
                </div>
              </div>
            </div>
          </figure>
        </section>

        {/* 05 VEHICULES */}
        <section id="vehicules" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="05" title="Véhicules" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            La flotte complète, avec l&apos;état opérationnel de chaque véhicule et sa disponibilité du jour.
          </p>
          <Steps
            items={[
              "Trois états possibles : <b>Disponible</b>, <b>Entretien</b>, <b>Hors service</b> — à mettre à jour depuis la fiche du véhicule.",
              "La fiche d'un véhicule permet d'ajouter une <b>photo</b> et de gérer ses indisponibilités ponctuelles.",
              "Un véhicule retiré de la flotte se <b>désactive</b> plutôt que de se supprimer, pour conserver son historique.",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/vehicules" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Véhicules" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Véhicules</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">Catégorie</th>
                      <th className="px-2 py-1 text-left font-semibold">Plaque</th>
                      <th className="px-2 py-1 text-left font-semibold">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Kia Seltos 2026</td><td className="border-t border-black/5 px-2 py-1">A123456</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">Disponible</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Tucson 4x4</td><td className="border-t border-black/5 px-2 py-1">A778812</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-800">Entretien</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
        </section>

        {/* 06 ENTRETIEN */}
        <section id="entretien" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="06" title="Entretien" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            L&apos;historique d&apos;entretien de toute la flotte : vidanges, freins, pneus, réparations,
            inspections.
          </p>
          <Steps
            items={[
              "<b>Nouvel entretien</b> pour enregistrer une intervention : véhicule, type, date, coût, et la date du prochain entretien prévu.",
              "Un entretien dont la date prévue est dépassée est marqué <b>En retard</b>.",
              "Un entretien erroné peut être supprimé directement depuis la liste.",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/entretiens" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Entretien" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Entretien</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">Véhicule</th>
                      <th className="px-2 py-1 text-left font-semibold">Type</th>
                      <th className="px-2 py-1 text-left font-semibold">Prochain</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Tucson 4x4</td><td className="border-t border-black/5 px-2 py-1">Vidange</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">En retard</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Kia Seltos</td><td className="border-t border-black/5 px-2 py-1">Pneus</td><td className="border-t border-black/5 px-2 py-1">15 janv.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
        </section>

        {/* 07 CLIENTS */}
        <section id="clients" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="07" title="Clients" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            La fiche client centralise ses coordonnées, ses documents (permis, cédula, passeport) et
            l&apos;historique complet de ses réservations passées.
          </p>
          <Steps
            items={[
              "Recherchez par nom, téléphone ou e-mail.",
              "Ouvrez une fiche client pour voir son <b>historique des réservations</b> sans le rechercher dans la liste des réservations.",
              "<b>Supprimer</b> est réservé aux administrateurs.",
            ]}
          />
          <Callout tone="warn">
            <b className="text-ink">Suppression protégée.</b> Un client ayant déjà des réservations enregistrées ne
            peut pas être supprimé — le panneau l&apos;indique clairement pour éviter de perdre l&apos;historique
            associé.
          </Callout>
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/clients" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Clients" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Clients</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">Nom</th>
                      <th className="px-2 py-1 text-left font-semibold">Téléphone</th>
                      <th className="px-2 py-1 text-left font-semibold">Permis</th>
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
        </section>

        {/* 08 GARANTS */}
        <section id="garants" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="08" title="Garants" badge="Nouveau" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            Un garant enregistré évite de ressaisir ses coordonnées à chaque contrat. Une fois créé, il apparaît
            dans un menu déroulant lors de la finalisation d&apos;un contrat de location.
          </p>
          <Steps
            items={[
              "Créez un garant une seule fois : nom, téléphone, cédula, adresse.",
              "Dans un contrat, choisissez-le dans <b>Garant enregistré</b> — les champs se remplissent automatiquement et restent modifiables.",
            ]}
          />
          <Callout tone="tip">
            <b className="text-ink">Supprimer un garant ne touche jamais un contrat déjà signé.</b> Les
            informations restent imprimées sur le contrat existant, seul le lien vers la fiche est retiré.
          </Callout>
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/garantes" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Garants" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Garants</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">Nom</th>
                      <th className="px-2 py-1 text-left font-semibold">Téléphone</th>
                      <th className="px-2 py-1 text-left font-semibold">Cédula</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Isabel Polanco</td><td className="border-t border-black/5 px-2 py-1">809 555 0100</td><td className="border-t border-black/5 px-2 py-1">001-1234567-8</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
        </section>

        {/* 09 TARIFS */}
        <section id="tarifs" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="09" title="Tarifs" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            La grille tarifaire par catégorie de véhicule, affichée aussi sur le site public. Trois paliers selon
            la durée de location.
          </p>
          <Steps
            items={[
              "Un <b>administrateur</b> clique directement sur un prix pour le modifier.",
              "Un <b>employé</b> consulte la grille en lecture seule.",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/tarifs" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Tarifs" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Tarifs</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">Catégorie</th>
                      <th className="px-2 py-1 text-left font-semibold">1-3 jours</th>
                      <th className="px-2 py-1 text-left font-semibold">4 jours et +</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Kia Seltos 2026</td><td className="border-t border-black/5 px-2 py-1">80 $</td><td className="border-t border-black/5 px-2 py-1">72 $</td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Hyundai</td><td className="border-t border-black/5 px-2 py-1">55 $</td><td className="border-t border-black/5 px-2 py-1">50 $</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
        </section>

        {/* 10 UTILISATEURS */}
        <section id="utilisateurs" className="scroll-mt-6 border-b border-black/10 py-8">
          <ChapterHead n="10" title="Utilisateurs" badge="Réservé aux admins" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            Gestion des comptes de l&apos;équipe. Seul un administrateur voit cette section.
          </p>
          <Steps
            items={[
              "<b>Nouvel utilisateur</b> : nom, e-mail, mot de passe temporaire à transmettre par un canal sécurisé, puis rôle (Admin ou Employé).",
              "<b>Désactiver</b> bloque immédiatement la connexion sans supprimer le compte — réversible via <b>Activer</b>.",
            ]}
          />
          <Callout>
            Un administrateur ne peut pas désactiver son propre compte, pour éviter de se retrouver bloqué hors du
            panneau.
          </Callout>
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/utilisateurs" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Utilisateurs" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Utilisateurs</p>
                <table className="w-full overflow-hidden rounded-md border border-black/10 bg-white text-[9px]">
                  <thead>
                    <tr className="bg-black/[0.04] text-black/50">
                      <th className="px-2 py-1 text-left font-semibold">Nom</th>
                      <th className="px-2 py-1 text-left font-semibold">Rôle</th>
                      <th className="px-2 py-1 text-left font-semibold">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border-t border-black/5 px-2 py-1">Maria G.</td><td className="border-t border-black/5 px-2 py-1">Admin</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">Actif</span></td></tr>
                    <tr><td className="border-t border-black/5 px-2 py-1">Ana T.</td><td className="border-t border-black/5 px-2 py-1">Employé</td><td className="border-t border-black/5 px-2 py-1"><span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">Désactivé</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </figure>
        </section>

        {/* 11 CONTRAT */}
        <section id="contrat" className="scroll-mt-6 py-8">
          <ChapterHead n="11" title="Contrat & signature" />
          <p className="mb-5 max-w-[62ch] text-[15px] text-ink-soft">
            Depuis une réservation, <b>Finaliser le contrat</b> ouvre le formulaire de remise du véhicule : heure,
            état, montants, garant et accessoires remis au client.
          </p>
          <Steps
            items={[
              "Remplissez la remise du véhicule, la franchise, l'acompte (le solde se calcule automatiquement) et, si besoin, sélectionnez un <a href='#garants' class='text-brand underline'>garant enregistré</a>.",
              "Cochez les accessoires remis avec le véhicule.",
              "<b>Enregistrer le contrat</b>, puis <b>Signer à l'écran</b> pour faire signer le client directement sur l'appareil.",
            ]}
          />
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/reservations/0144/contrat/editar" />
            <div className="flex min-h-[200px] bg-[#fbfaf9] text-[10.5px] text-ink">
              <Sidebar active="Réservations" />
              <div className="flex-1 p-3.5">
                <p className="mb-2 text-[13px] font-bold">Finaliser le contrat</p>
                <div className="mb-2 grid grid-cols-3 gap-2">
                  <div><span className="mb-0.5 block text-[8.5px] text-black/50">Heure de remise</span><div className="rounded border border-black/15 bg-white px-2 py-1 text-[9.5px]">14:30</div></div>
                  <div><span className="mb-0.5 block text-[8.5px] text-black/50">Couleur</span><div className="rounded border border-black/15 bg-white px-2 py-1 text-[9.5px]">Blanc</div></div>
                  <div><span className="mb-0.5 block text-[8.5px] text-black/50">Essence</span><div className="rounded border border-black/15 bg-white px-2 py-1 text-[9.5px]">3/4</div></div>
                </div>
                <span className="mb-0.5 block text-[8.5px] text-black/50">Garant enregistré</span>
                <div className="mb-2 rounded border border-black/15 bg-white px-2 py-1 text-[9.5px]">Isabel Polanco</div>
                <span className="mb-1 block text-[8.5px] text-black/50">Accessoires remis</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded bg-ink px-1.5 py-0.5 text-[8px] text-white">Climatisation</span>
                  <span className="rounded bg-ink px-1.5 py-0.5 text-[8px] text-white">Roue de secours</span>
                  <span className="rounded bg-black/5 px-1.5 py-0.5 text-[8px] text-black/60">Cric</span>
                </div>
              </div>
            </div>
          </figure>

          <p className="my-5 max-w-[62ch] text-[15px] text-ink-soft">
            <b className="text-ink">Signature en plein écran.</b> Sur <b>Signer à l&apos;écran</b>, le menu latéral
            disparaît entièrement — utile quand la tablette ou l&apos;ordinateur passe entre les mains du client
            pour signer, sans qu&apos;il voie ou ne touche le reste du panneau.
          </p>
          <figure className="max-w-[560px] overflow-hidden rounded-xl border border-black/10 bg-[#111] shadow-sm">
            <FrameBar url="ivjrentcar.com/admin/reservations/0144/contrat/firmar" />
            <div className="flex min-h-[220px] items-center justify-center bg-[#f2f1ef] p-6">
              <div className="w-[240px] rounded-lg border border-black/10 bg-white p-3">
                <p className="mb-2 text-[11px] font-bold">Signer le contrat</p>
                <div className="mb-1.5"><span className="mb-0.5 block text-[8.5px] text-black/50">Client</span><div className="rounded border border-black/15 px-2 py-1 text-[9.5px]">Léa Duval</div></div>
                <div className="mb-1.5"><span className="mb-0.5 block text-[8.5px] text-black/50">Véhicule</span><div className="rounded border border-black/15 px-2 py-1 text-[9.5px]">Tucson 4x4</div></div>
                <span className="mb-0.5 block text-[8.5px] text-black/50">Signature</span>
                <div className="mb-2 flex h-[54px] items-center justify-center rounded border border-dashed border-black/20 bg-[#fdfdfc]">
                  <svg width="120" height="30" viewBox="0 0 140 34" fill="none">
                    <path d="M4 26 C 14 6, 22 6, 28 20 C 34 32, 40 12, 48 14 C 58 17, 60 28, 72 18 C 82 10, 88 24, 100 16 C 110 10, 116 22, 128 12"
                      stroke="#18140F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1 rounded border border-black/15 py-1 text-center text-[9.5px] font-semibold">Effacer</div>
                  <div className="flex-1 rounded bg-brand py-1 text-center text-[9.5px] font-semibold text-white">Confirmer</div>
                </div>
              </div>
            </div>
          </figure>
        </section>
      </div>

      <p className="max-w-[62ch] text-xs text-black/40">
        Document évolutif — mis à jour à chaque nouvelle fonctionnalité ajoutée au panneau.{" "}
        <Link href="/admin" className="text-brand hover:underline">Retour au tableau de bord</Link>
      </p>
    </div>
  );
}
