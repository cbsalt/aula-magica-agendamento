import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicBookingPage from "@/components/PublicBookingPage";

export default async function AppointmentPage(props) {
  const params = await props.params;
  const { id } = params;

  // Find teacher by ID
  const teacher = await prisma.teacher.findUnique({
    where: {
      publicLinkId: id,
    },
    include: {
      paymentConfig: true,
    },
  });

  if (!teacher) {
    notFound();
  }

  return <PublicBookingPage teacher={teacher} />;
}
