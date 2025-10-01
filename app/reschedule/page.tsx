import PublicBookingPage from "@/components/PublicBookingPage";
import { findBooking, findBookingsByBatchId } from "@/modules/booking";
import { findTeacherById, serializeTeacher } from "@/modules/teacher";
import { notFound } from "next/navigation";

export default async function ReschedulePage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; bookingId?: string }>;
}) {
  const params = await searchParams;

  const batchId = params.batchId;
  const bookingId = params.bookingId;

  let booking;

  if (batchId) {
    booking = await findBookingsByBatchId(batchId);
  } else if (bookingId) {
    booking = await findBooking(bookingId);
  }

  const teacherId = Array.isArray(booking)
    ? booking[0]?.teacherId
    : booking?.teacherId;

  const teacher = await findTeacherById(teacherId, {
    paymentConfig: true,
  });

  const serializedTeacher = serializeTeacher(teacher);

  if (!serializedTeacher) {
    notFound();
  }

  return <PublicBookingPage teacher={serializedTeacher} />;
}
