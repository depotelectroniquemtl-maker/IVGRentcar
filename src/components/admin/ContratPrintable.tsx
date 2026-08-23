import Image from "next/image";
import { ACCESSOIRES_CONTRAT, NIVEAUX_ESSENCE } from "@/lib/contrat-accessoires";

// Reproduit le contrat papier I.V.J Rent A Car — contenu et libellés fixés par le client
// (relecture du document original), volontairement en espagnol quelle que soit la langue
// de l'admin : c'est le document légal lui-même, pas une interface à traduire. Un
// "Field" vide affiche une ligne à compléter à la main plutôt qu'un tiret, pour rester
// utilisable comme un vrai formulaire papier si une donnée n'a pas été saisie en amont.
const BLANC = "_______________";

function Champ({ label, value, extra }: { label: string; value?: string | null; extra?: string }) {
  return (
    <div className="flex items-baseline gap-1 border-b border-black/20 pb-0.5">
      <span className="shrink-0 text-black/60">{label}:</span>
      <span className="flex-1 font-medium">{value || BLANC}</span>
      {extra && <span className="shrink-0 text-[10px] text-black/50">{extra}</span>}
    </div>
  );
}

function MESES_ES(mois: number) {
  const noms = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return noms[mois] ?? "";
}

export type ContratPrintableData = {
  copyLabel: string;
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

export function ContratPrintable({ data }: { data: ContratPrintableData }) {
  const { cliente, vehicule, reservation, contrat, copyLabel } = data;

  const fechaSalida = new Date(reservation.dateDebut + "T00:00:00");
  const dia = fechaSalida.getDate();
  const mes = MESES_ES(fechaSalida.getMonth());
  const anio = fechaSalida.getFullYear();

  return (
    <div className="mx-auto w-full max-w-[850px] break-inside-avoid bg-white p-8 text-[11px] leading-snug text-black print:p-6">
      <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
        <Image src="/logo.png" alt="I.V.J" width={160} height={51} className="h-12 w-auto" />
        <div className="text-right">
          <p className="text-sm font-bold">TU CONFIANZA EN EL VOLANTE</p>
          <p className="mt-0.5">📞 849-205-2571 · Isabel Hulmann Polanco</p>
        </div>
      </div>

      <p className="mt-1 text-right text-[10px] font-bold uppercase tracking-wider text-black/50">
        {copyLabel}
      </p>

      <section className="mt-3">
        <h2 className="border-b border-black bg-black/5 px-1 py-0.5 text-xs font-bold uppercase">
          Datos del Cliente
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
          <Champ label="Nombre" value={cliente.nom} />
          <Champ label="Dirección" value={cliente.adresse} />
          <Champ label="Telefonos" value={cliente.telephone} />
          <Champ label="Nacionalidad" value={cliente.nationalite} />
          <Champ label="Cedula" value={cliente.cedula} />
          <Champ label="Residencia" value={cliente.residencia} />
          <Champ
            label="Pasaporte"
            value={cliente.passeport}
            extra={cliente.passeportExpiration ? `Expira en: ${cliente.passeportExpiration}` : undefined}
          />
          <Champ
            label="Licencia"
            value={cliente.numeroPermis}
            extra={cliente.permisExpiration ? `Expira en: ${cliente.permisExpiration}` : undefined}
          />
        </div>
      </section>

      <section className="mt-3">
        <h2 className="border-b border-black bg-black/5 px-1 py-0.5 text-xs font-bold uppercase">
          Datos del Vehiculo
        </h2>
        <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-1.5">
          <Champ label="Hora" value={contrat?.heureRemise?.slice(0, 5)} />
          <Champ label="Color del Vehiculo" value={contrat?.couleurVehicule ?? vehicule.couleur} />
          <Champ label="Tipo de Vehiculo" value={vehicule.categorieNom} />
          <Champ label="No. Placa" value={vehicule.plaque} />
          <Champ
            label="Deducible"
            value={contrat?.deducibleUsd != null ? `US$ ${contrat.deducibleUsd}` : null}
          />
          <Champ label="Fecha Salida" value={reservation.dateDebut} />
          <Champ label="Posible Retorno" value={reservation.dateFin} />
          <Champ
            label="Precio P/dia"
            value={reservation.precioPorDia != null ? `US$ ${reservation.precioPorDia}` : null}
          />
          <Champ label="Abono $" value={contrat?.abonoUsd != null ? `US$ ${contrat.abonoUsd}` : null} />
          <Champ label="Dias Rentado" value={String(reservation.diasRentado)} />
          <Champ
            label="Balance Pendiente"
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
          Datos del Garante
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
          <Champ label="Nombre" value={contrat?.garantNom} />
          <Champ label="Direccion" value={contrat?.garantAdresse} />
          <Champ label="Cedula" value={contrat?.garantCedula} />
          <Champ label="Telefono" value={contrat?.garantTelephone} />
        </div>
      </section>

      <section className="mt-3">
        <div className="grid grid-cols-4 gap-x-3 gap-y-1">
          {ACCESSOIRES_CONTRAT.map((item) => (
            <label key={item.key} className="flex items-center gap-1.5">
              <span className="flex h-3 w-3 shrink-0 items-center justify-center border border-black text-[8px] leading-none">
                {contrat?.accessoires?.[item.key] ? "X" : ""}
              </span>
              {item.label}
            </label>
          ))}
        </div>
      </section>

      <p className="mt-3 text-center text-[10px] font-bold">NOTA: NO HACEMOS DEVOLUCION DE EFECTIVO</p>

      <p className="mt-3 text-justify text-[10px] leading-relaxed">
        Soy el cliente, quien garantiza y asegura que todo lo que esta marcado arriba es
        correcto, por lo tanto, me comprometo a devolverlo de la misma forma, en caso de no
        ser asi, tengo que pagar a Sra. Isabel Hulmann Polanco y/o ETICA RENTA CAR el valor
        del costo de cada accesorio que le falten al vehiculo en el momento de la entrega.
      </p>

      <p className="mt-2 text-justify text-[10px] leading-relaxed">
        Hecho y firmado de buena fe con una original y una copia, en la ciudad de Las
        Terrenas, Rep. Dom. hoy dia <strong>{dia}</strong> del mes de{" "}
        <strong>{mes}</strong> del año <strong>{anio}</strong> (declarado haber leido el
        dorso de este contrato)
      </p>

      <div className="mt-8 grid grid-cols-3 gap-6 text-center text-[10px]">
        {["Cliente", "Garante", "Rentado por"].map((label) => (
          <div key={label} className="flex flex-col">
            <div className="h-12 border-b border-black" />
            <p className="mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
