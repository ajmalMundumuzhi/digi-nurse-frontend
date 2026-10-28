import { Stethoscope } from "lucide-react";
import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function DoctorOrdersPage() {
  return (
    <ModulePlaceholder
      icon={Stethoscope}
      eyebrow="CARE COORDINATION"
      title="Doctor Orders"
      description="Review orders, authentication, and nurse acknowledgements."
    />
  );
}