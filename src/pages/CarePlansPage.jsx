import { ClipboardList } from "lucide-react";
import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function CarePlansPage() {
  return (
    <ModulePlaceholder
      icon={ClipboardList}
      eyebrow="PLANNED CARE"
      title="Nursing Care Plans"
      description="Manage care problems, goals, interventions, and evaluations."
    />
  );
}