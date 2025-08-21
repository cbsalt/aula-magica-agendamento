import { notFound } from "next/navigation";
import PublicBookingPage from "@/components/PublicBookingPage";
import { findTeacherByPublicLink } from "@/modules/teacher";

export default async function AppointmentPage(props) {
  const params = await props.params;
  const { id } = params;

  const teacher = await findTeacherByPublicLink(id, {
    paymentConfig: true,
  });

  if (!teacher) {
    notFound();
  }

  return <PublicBookingPage teacher={teacher} />;
}
