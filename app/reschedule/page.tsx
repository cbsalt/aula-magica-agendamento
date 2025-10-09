import { notFound, redirect } from "next/navigation";

import { PublicBookingPage } from "@/components";
import { findBooking, findBookingsByBatchId } from "@/modules/booking";
import { findTeacherById, serializeTeacher } from "@/modules/teacher";

export default async function ReschedulePage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; bookingId?: string }>;
}) {
  const params = await searchParams;

  const { batchId, bookingId } = params;

  const search = new URLSearchParams();
  if (bookingId) search.set("bookingId", bookingId);
  else if (batchId) search.set("batchId", batchId);

  let booking;

  if (batchId) {
    booking = await findBookingsByBatchId(batchId);
  } else if (bookingId) {
    booking = await findBooking(bookingId);
  }

  const teacherId = Array.isArray(booking)
    ? booking[0]?.teacherId
    : booking?.teacherId;

  if (!teacherId) {
    notFound();
  }

  const teacher = await findTeacherById(teacherId, {
    paymentConfig: true,
  });

  const serializedTeacher = serializeTeacher(teacher);

  if (!serializedTeacher) {
    notFound();
  }

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/bookings/reschedule?${search.toString()}`
  );

  if (!res.ok) {
    return redirect("/no-bookings-to-reschedule");
  }

  const data = await res.json();

  return (
    <PublicBookingPage teacher={serializedTeacher} scheduled={data.bookings} />
  );
}
