"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, inputClass, labelClass, primaryButtonClass, secondaryLinkClass } from "@/components/admin/form-ui";

const ETATS = ["disponible", "maintenance", "hors_service"] as const;

type Vehicule = {
  id: string;
  categorie_id: string;
  plaque: string | null;
  annee: number | null;
  couleur: string | null;
  etat_operationnel: string;
  notes: string | null;
  actif: boolean;
  photo_url: string | null;
  solde_achat_usd: number | null;
  raison_retrait: string | null;
};

export function VehiculeForm({
  title,
  categories,
  vehicule,
}: {
  title: string;
  categories: { id: string; nom: string }[];
  vehicule?: Vehicule;
}) {
  const router = useRouter();
  const t = useTranslations("admin.vehicules");
  const tCommon = useTranslations("admin.common");
  const editing = Boolean(vehicule);

  const ETAT_LABELS: Record<(typeof ETATS)[number], string> = {
    disponible: tCommon("vehicule_etat_disponible"),
    maintenance: tCommon("vehicule_etat_maintenance"),
    hors_service: tCommon("vehicule_etat_hors_service"),
  };

  const [categorieId, setCategorieId] = useState(vehicule?.categorie_id ?? "");
  const [plaque, setPlaque] = useState(vehicule?.plaque ?? "");
  const [annee, setAnnee] = useState(vehicule?.annee?.toString() ?? "");
  const [couleur, setCouleur] = useState(vehicule?.couleur ?? "");
  const [etat, setEtat] = useState(vehicule?.etat_operationnel ?? "disponible");
  const [notes, setNotes] = useState(vehicule?.notes ?? "");
  const [actif, setActif] = useState(vehicule?.actif ?? true);
  const [raisonRetrait, setRaisonRetrait] = useState(vehicule?.raison_retrait ?? "");
  const [soldeAchat, setSoldeAchat] = useState(vehicule?.solde_achat_usd?.toString() ?? "");
  const [photoUrl, setPhotoUrl] = useState(vehicule?.photo_url ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(vehicule?.photo_url ?? null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : (vehicule?.photo_url ?? null));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    let nouvellePhotoUrl = photoUrl;
    if (photoFile) {
      // Chemin indépendant de l'id véhicule (utile en création, avant que la ligne
      // n'existe) — un identifiant aléatoire évite aussi les collisions de cache CDN si
      // le fichier est remplacé plus tard sous un autre nom.
      const extension = photoFile.name.split(".").pop() ?? "jpg";
      const chemin = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("vehicules-photos")
        .upload(chemin, photoFile, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      nouvellePhotoUrl = supabase.storage.from("vehicules-photos").getPublicUrl(chemin).data.publicUrl;
      setPhotoUrl(nouvellePhotoUrl);
    }

    const payload = {
      categorie_id: categorieId,
      plaque: plaque.trim() || null,
      annee: annee ? Number(annee) : null,
      couleur: couleur || null,
      etat_operationnel: etat,
      notes: notes || null,
      actif,
      raison_retrait: actif ? null : raisonRetrait.trim() || null,
      photo_url: nouvellePhotoUrl,
      solde_achat_usd: soldeAchat ? Number(soldeAchat) : null,
    };

    const { error } = editing
      ? await supabase.from("vehicules").update(payload).eq("id", vehicule!.id)
      : await supabase.from("vehicules").insert(payload);

    if (error) {
      setError(error.code === "23505" ? t("error_duplicate_plaque") : error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/vehicules");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/vehicules" className={secondaryLinkClass}>
            {tCommon("cancel")}
          </Link>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? tCommon("saving") : editing ? t("save_changes") : t("submit_create")}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card title={t("section_identificacion")}>
            <label className="block text-sm">
              <span className={labelClass}>{t("field_categoria")}</span>
              <select
                required
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  {t("field_categoria_placeholder")}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className={labelClass}>{t("field_placa")}</span>
                <input
                  type="text"
                  value={plaque}
                  onChange={(e) => setPlaque(e.target.value)}
                  placeholder={t("field_placa_placeholder")}
                  className={`${inputClass} font-mono`}
                />
              </label>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_anio")}</span>
                <input
                  type="number"
                  value={annee}
                  onChange={(e) => setAnnee(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm">
                <span className={labelClass}>{t("field_color")}</span>
                <input
                  type="text"
                  value={couleur}
                  onChange={(e) => setCouleur(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </Card>

          <Card title={t("field_notas")}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className={inputClass}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title={t("section_estado")}>
            <div className="flex flex-col gap-2">
              <span className={labelClass}>{t("field_estado")}</span>
              <div className="flex gap-2">
                {ETATS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEtat(s)}
                    className={`flex-1 rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
                      s === etat
                        ? "border-brand/40 bg-brand/10 text-brand-dark"
                        : "border-black/15 text-ink-soft hover:bg-black/5"
                    }`}
                  >
                    {ETAT_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={actif}
                onChange={(e) => setActif(e.target.checked)}
                className="h-4 w-4 rounded border-black/20"
              />
              <span className="font-medium text-ink">{t("field_activo")}</span>
            </label>

            {!actif && (
              <label className="block text-sm">
                <span className={labelClass}>{t("field_raison_retrait")}</span>
                <textarea
                  value={raisonRetrait}
                  onChange={(e) => setRaisonRetrait(e.target.value)}
                  placeholder={t("field_raison_retrait_placeholder")}
                  rows={3}
                  className={inputClass}
                />
              </label>
            )}
          </Card>

          <Card title={t("section_financement")}>
            <label className="block text-sm">
              <span className={labelClass}>{t("field_solde_achat")}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={soldeAchat}
                onChange={(e) => setSoldeAchat(e.target.value)}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-ink-soft">{t("field_solde_achat_hint")}</span>
            </label>
          </Card>

          <Card title={t("field_foto")}>
            {photoPreview ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-black/5">
                {photoFile ? (
                  // Aperçu local (blob:) avant envoi — next/image n'accepte pas les URL
                  // blob:, seules les URL http(s) remote/local passent par l'optimiseur.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Image src={photoPreview} alt="" fill sizes="300px" className="object-cover" />
                )}
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-dashed border-black/20 bg-black/[0.02] text-xs text-ink-soft">
                {t("field_foto_vacia")}
              </div>
            )}
            <label className={`${secondaryLinkClass} inline-block cursor-pointer text-center`}>
              {t("field_foto_elegir")}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </Card>
        </div>
      </div>
    </form>
  );
}
