import { Users } from "lucide-react";
import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function PatientsPage() {
  return (
    <ModulePlaceholder
      icon={Users}
      eyebrow="PATIENT CARE"
      title="Patients"
      description="Search and review patients in your institution."
    />
  );
}