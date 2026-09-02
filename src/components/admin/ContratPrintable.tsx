import Image from "next/image";
import { ACCESSOIRES_CONTRAT, NIVEAUX_ESSENCE } from "@/lib/contrat-accessoires";
import type { getAdminTranslator } from "@/lib/admin-i18n";
import type { AdminLocale } from "@/lib/admin-locale";

// Reproduit le contrat papier I.V.J Rent A Car — contenu et libellés fixés par le client
// (relecture du document original). Le texte suit désormais la langue admin sélectionnée
// (admin_locale, même mécanisme que le reste du panneau) via le traducteur "t" passé en
// prop — seul le slogan de marque "TU CONFIANZA EN EL VOLANTE" reste figé dans les 3
// langues, c'est une identité de marque intégrée au logo, pas une phrase d'interface. Un
// "Field" vide affiche une ligne à compléter à la main plutôt qu'un tiret, pour rester
// utilisable comme un vrai formulaire papier si une donnée n'a pas été saisie en amont.
const BLANC = "_______________";

type ContratTranslator = Awaited<ReturnType<typeof getAdminTranslator<"admin.contratoImprimible">>>;

function Champ({ label, value, extra }: { label: string; value?: string | null; extra?: string }) {
  return (
    <div className="flex items-baseline gap-1 border-b border-black/20 pb-0.5">
      <span className="shrink-0 text-black/60">{label}:</span>
      <span className="flex-1 font-medium">{value || BLANC}</span>
      {extra && <span className="shrink-0 text-[10px] text-black/50">{extra}</span>}
    </div>
  );
}

export type ContratPrintableData = {
  copyLabel: "cliente" | "compania";
  signatureClient: string | null;
  cliente: {
    nom: string;
    adresse: string | null;
    telephone: string | null;
    nationalite: string | null;
    cedula: string | null;
    residencia: string | null;
    passeport: string | null;
    passeportExpiration: string | null;
    numeroPermis: string | null;
    permisExpiration: string | null;
  };
  vehicule: {
    categorieNom: string;
    plaque: string | null;
    couleur: string | null;
  };
  reservation: {
    dateDebut: string;
    dateFin: string;
    diasRentado: number;
    precioPorDia: number | null;
    precioTotal: number | null;
  };
  contrat: {
    heureRemise: string | null;
    couleurVehicule: string | null;
    deducibleUsd: number | null;
    abonoUsd: number | null;
    soldeUsd: number | null;
    niveauEssence: string | null;
    accessoires: Record<string, boolean>;
    garantNom: string | null;
    garantAdresse: string | null;
    garantCedula: string | null;
    garantTelephone: string | null;
  } | null;
};

export function ContratPrintable({
  data,
  t,
  locale,
}: {
  data: ContratPrintableData;
  t: ContratTranslator;
  locale: AdminLocale;
}) {
  const { cliente, vehicule, reservation, contrat, copyLabel, signatureClient } = data;

  const fechaSalida = new Date(reservation.dateDebut + "T00:00:00");
  const dia = fechaSalida.getDate();
  const mes = new Intl.DateTimeFormat(locale, { month: "long" }).format(fechaSalida).toLowerCase();
  const anio = fechaSalida.getFullYear();

  return (
    <div className="mx-auto w-full max-w-[680px] break-inside-avoid bg-white p-8 text-[11px] leading-snug text-black print:p-4">
      <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
        <Image src="/logo.png" alt="I.V.J" width={160} height={51} className="h-12 w-auto" />
        <div className="text-right">
          <p className="text-sm font-bold">TU CONFIANZA EN EL VOLANTE</p>
          <p className="mt-0.5">📞 849-205-2571 · Isabel Hulmann Polanco</p>
        </div>
      </div>

      <p className="mt-1 text-right text-[10px] font-bold uppercase tracking-wider text-black/50">
        {copyLabel === "cliente" ? t("copia_cliente") : t("copia_compania")}
      </p>

      <section className="mt-3">
        <h2 className="border-b border-black bg-black/5 px-1 py-0.5 text-xs font-bold uppercase">
          {t("section_cliente")}
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
          <Champ label={t("field_nombre")} value={cliente.nom} />
          <Champ label={t("field_direccion")} value={cliente.adresse} />
          <Champ label={t("field_telefonos")} value={cliente.telephone} />
          <Champ label={t("field_nacionalidad")} value={cliente.nationalite} />
          <Champ label={t("field_cedula")} value={cliente.cedula} />
          <Champ label={t("field_residencia")} value={cliente.residencia} />
          <Champ
            label={t("field_pasaporte")}
            value={cliente.passeport}
            extra={
              cliente.passeportExpiration
                ? `${t("expira_en")}: ${cliente.passeportExpiration}`
                : undefined
            }
          />
          <Champ
            label={t("field_licencia")}
            value={cliente.numeroPermis}
            extra={
              cliente.permisExpiration ? `${t("expira_en")}: ${cliente.permisExpiration}` : undefined
            }
          />
        </div>
      </section>

      <section className="mt-3">
        <h2 className="border-b border-black bg-black/5 px-1 py-0.5 text-xs font-bold uppercase">
          {t("section_vehiculo")}
        </h2>
        <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-1.5">
          <Champ label={t("field_hora")} value={contrat?.heureRemise?.slice(0, 5)} />
          <Champ label={t("field_color_vehiculo")} value={contrat?.couleurVehicule ?? vehicule.couleur} />
          <Champ label={t("field_tipo_vehiculo")} value={vehicule.categorieNom} />
          <Champ label={t("field_placa")} value={vehicule.plaque} />
          <Champ
            label={t("field_deducible")}
            value={contrat?.deducibleUsd != null ? `US$ ${contrat.deducibleUsd}` : null}
          />
          <Champ label={t("field_fecha_salida")} value={reservation.dateDebut} />
          <Champ label={t("field_retorno")} value={reservation.dateFin} />
          <Champ
            label={t("field_precio_dia")}
            value={reservation.precioPorDia != null ? `US$ ${reservation.precioPorDia}` : null}
          />
          <Champ
            label={t("field_precio_total")}
            value={reservation.precioTotal != null ? `US$ ${reservation.precioTotal}` : null}
          />
          <Champ label={t("field_abono")} value={contrat?.abonoUsd != null ? `US$ ${contrat.abonoUsd}` : null} />
          <Champ label={t("field_dias_rentado")} value={String(reservation.diasRentado)} />
          <Champ
            label={t("field_balance")}
            value={contrat?.soldeUsd != null ? `US$ ${contrat.soldeUsd}` : null}
          />
        </div>

        <div className="relative mt-3 flex items-center justify-between px-4">
          <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-black/30" />
          {NIVEAUX_ESSENCE.map((n) => (
            <span
              key={n}
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white text-[9px] font-bold ${
                n === contrat?.niveauEssence ? "bg-black text-white" : "text-black/50"
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-3">
        <h2 className="border-b border-black bg-black/5 px-1 py-0.5 text-xs font-bold uppercase">
          {t("section_garante")}
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
          <Champ label={t("field_nombre")} value={contrat?.garantNom} />
          <Champ label={t("field_garante_direccion")} value={contrat?.garantAdresse} />
          <Champ label={t("field_cedula")} value={contrat?.garantCedula} />
          <Champ label={t("field_garante_telefono")} value={contrat?.garantTelephone} />
        </div>
      </section>

      <section className="mt-3">
        <div className="grid grid-cols-4 gap-x-3 gap-y-1">
          {ACCESSOIRES_CONTRAT.map((item) => (
            <label key={item.key} className="flex items-center gap-1.5">
              <span className="flex h-3 w-3 shrink-0 items-center justify-center border border-black text-[8px] leading-none">
                {contrat?.accessoires?.[item.key] ? "X" : ""}
              </span>
              {t(`accesorios.${item.key}` as never)}
            </label>
          ))}
        </div>
      </section>

      <p className="mt-3 text-center text-[10px] font-bold">{t("nota_no_devolucion")}</p>

      <p className="mt-3 text-justify text-[10px] leading-relaxed">{t("legal_garantia")}</p>

      <p className="mt-2 text-justify text-[10px] leading-relaxed">
        {t.rich("legal_signature", {
          b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
          dia,
          mes,
          anio,
        })}
      </p>

      <div className="mt-8 grid grid-cols-3 gap-6 text-center text-[10px]">
        {[
          { label: t("signature_cliente"), imagen: signatureClient },
          { label: t("signature_garante"), imagen: null },
          { label: t("signature_rentado_por"), imagen: null },
        ].map(({ label, imagen }) => (
          <div key={label} className="flex flex-col">
            <div className="flex h-12 items-end justify-center border-b border-black">
              {imagen && (
                // eslint-disable-next-line @next/next/no-img-element -- data URI, pas un asset optimisable par next/image
                <img src={imagen} alt="" className="max-h-11 object-contain" />
              )}
            </div>
            <p className="mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
