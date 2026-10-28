import { FileText } from "lucide-react";
import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function NursingRecordsPage() {
  return (
    <ModulePlaceholder
      icon={FileText}
      eyebrow="CLINICAL DOCUMENTATION"
      title="Nursing Records"
      description="Review nursing assessments, observations, and progress notes."
    />
  );
}