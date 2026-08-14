import { LocationForm } from "@/components/admin/LocationForm";
import { Shell } from "@/components/Shell";

export default function NewLocationPage() {
  return (
    <Shell>
      <h1 className="mb-5 text-3xl font-semibold text-slate-950">Create Location</h1>
      <LocationForm />
    </Shell>
  );
}
