import { ClienteForm } from "@/components/admin/ClienteForm";

export default function NuevoClientePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Nuevo cliente</h1>
      <ClienteForm />
    </div>
  );
}
