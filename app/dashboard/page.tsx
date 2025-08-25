import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Dashboard from "@/components/Dashboard";

import { findTeacherByEmail } from "@/modules/teacher";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const teacher = await findTeacherByEmail(session.user?.email, {
    paymentConfig: true,
  });

  return <Dashboard teacherFallback={teacher} />;
}
