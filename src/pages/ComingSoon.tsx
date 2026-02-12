import DashboardLayout from "@/components/layout/DashboardLayout";
import { Construction } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Construction className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">This feature is coming soon. Stay tuned!</p>
      </div>
    </DashboardLayout>
  );
}
