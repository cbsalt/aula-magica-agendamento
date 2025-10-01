import PublicBookingPage from "@/components/PublicBookingPage";
import { findBooking, findBookingsByBatchId } from "@/modules/booking";
import { findTeacherById, serializeTeacher } from "@/modules/teacher";
import { notFound } from "next/navigation";

export default async function ReschedulePage(props) {
  const batchId = props.searchParams.batchId;
  const bookingId = props.searchParams.bookingId;

  let booking;

  if (batchId) {
    booking = await findBookingsByBatchId(batchId);
  } else if (bookingId) {
    booking = await findBooking(bookingId);
  }

  const teacherId = booking[0]?.teacherId;

  const teacher = await findTeacherById(teacherId, {
    paymentConfig: true,
  });

  const serializedTeacher = serializeTeacher(teacher);

  if (!serializedTeacher) {
    notFound();
  }

  return <PublicBookingPage teacher={serializedTeacher} />;
}
