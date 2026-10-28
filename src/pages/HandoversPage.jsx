import { Activity } from "lucide-react";
import ModulePlaceholder from "../components/common/ModulePlaceholder";

export default function HandoversPage() {
  return (
    <ModulePlaceholder
      icon={Activity}
      eyebrow="SHIFT COORDINATION"
      title="Shift Handovers"
      description="Prepare, submit, and acknowledge shift handovers."
    />
  );
}