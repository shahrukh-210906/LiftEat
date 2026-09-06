import { AppLayout } from "@/components/layout/AppLayout";
import { ProgressTab } from "@/components/dashboard/ProgressTab";

export default function Progress() {
  return (
    <AppLayout>
      <div className="container mx-auto p-4 pb-24 space-y-6 animate-in fade-in duration-500">
        <ProgressTab />
      </div>
    </AppLayout>
  );
}