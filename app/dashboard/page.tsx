import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import { authOptions } from "@/lib/auth";
import { findTeacherByEmail, serializeTeacher } from "@/modules/teacher";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const teacher = await findTeacherByEmail(session.user?.email, {
    paymentConfig: true,
  });

  const serializedTeacher = serializeTeacher(teacher);

  return (
    <>
      <Dashboard teacherFallback={serializedTeacher} />
      <Footer />
    </>
  );
}
