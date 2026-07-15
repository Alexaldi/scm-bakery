import DashboardShell from "@/components/dashboard-shell";
import { ScmProvider } from "@/context/scm-context";
import { requireSession } from "@/lib/auth/session";
import { getScmData } from "@/lib/db/scm-data";

export default async function DashboardLayout({ children }) {
  const session = await requireSession();
  const initialScmData = await getScmData();

  return (
    <ScmProvider initialData={initialScmData} session={session}>
      <DashboardShell>{children}</DashboardShell>
    </ScmProvider>
  );
}
