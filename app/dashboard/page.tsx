import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import { authOptions } from "@/lib/auth";
import { findTeacherByEmail, serializeTeacher } from "@/modules/teacher";
import { getServerSession } from "next-auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const WEEKS_TO_SHOW = 1;

const customFetch = async (url: string, options: RequestInit = {}) => {
  const hdrs = await headers();
  const cookieStore = await cookies();

  const currentHeaders = Object.fromEntries(hdrs.entries());
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return fetch(url, {
    ...options,
    headers: {
      ...currentHeaders,
      cookie: cookieHeader,
      ...options.headers,
    },
  });
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("auth/signin");

  const teacher = await findTeacherByEmail(session.user?.email, {
    paymentConfig: true,
  });

  const serializedTeacher = serializeTeacher(teacher);

  const [availabilityRes, teacherRes, previewRes] = await Promise.allSettled([
    customFetch(`${process.env.NEXTAUTH_URL}/api/teachers/me/availability`),
    customFetch(`${process.env.NEXTAUTH_URL}/api/teachers/me`),
    customFetch(`${process.env.NEXTAUTH_URL}/api/teachers/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teacherId: teacher.id, weeks: WEEKS_TO_SHOW }),
    }),
  ]);

  const initialAvailability =
    availabilityRes.status === "fulfilled" && availabilityRes.value.ok
      ? await availabilityRes.value.json()
      : null;

  const teacherProfile =
    teacherRes.status === "fulfilled" && teacherRes.value.ok
      ? await teacherRes.value.json()
      : null;

  const previewData =
    previewRes.status === "fulfilled" && previewRes.value.ok
      ? { availability: (await previewRes.value.json()).availability }
      : null;

  return (
    <>
      <Dashboard
        teacherFallback={serializedTeacher}
        previewData={previewData}
        initialAvailability={initialAvailability}
        teacherProfile={teacherProfile}
      />
      <Footer />
    </>
  );
}
