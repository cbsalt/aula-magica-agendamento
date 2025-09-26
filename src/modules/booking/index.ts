import { prisma } from "@/lib/prisma";
import { Booking } from "@prisma/client";

const TEN_MINUTES = 10 * 60 * 1000;

export function findBooking(id): Promise<Booking> {
  return prisma.booking.findUnique({
    where: { id },
  });
}

export function createBooking({
  bookingData,
  status,
  notes,
  batchId = null,
  isBatchMaster = false,
}) {
  return prisma.booking.create({
    data: {
      teacherId: bookingData.teacherId,
      studentName: bookingData.metadata.studentName,
      studentEmail: bookingData.studentEmail,
      date: bookingData.metadata.date,
      time: bookingData.metadata.time,
      amount: bookingData.amount,
      currency: bookingData.currency,
      status,
      notes,
      batchId,
      isBatchMaster,
    },
  });
}

export async function createBatchBookings({
  bookingData,
  timeSlots,
  status,
  notes,
}): Promise<{ bookings: Booking[]; batchId: string }> {
  if (!timeSlots || timeSlots.length === 0) {
    throw new Error("Nenhum horário informado para criar o batch.");
  }

  const batchId = `batch_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;

  const result = await prisma.$transaction(async (tx) => {
    const bookings = await Promise.all(
      timeSlots.map((slot, index) =>
        tx.booking.create({
          data: {
            teacherId: bookingData.teacherId,
            studentName: bookingData.metadata.studentName,
            studentEmail: bookingData.studentEmail,
            date: slot.date,
            time: slot.time,
            amount: bookingData.amount,
            currency: bookingData.currency,
            status,
            notes,
            batchId,
            isBatchMaster: index === 0, // primeiro booking do lote é o "mestre"
          },
        })
      )
    );

    return { bookings, batchId };
  });

  return result;
}

export function findBookingsByBatchId(batchId: string) {
  return prisma.booking.findMany({
    where: { batchId },
    orderBy: { createdAt: "asc" },
  });
}

export function updateBooking({ booking, data }) {
  return prisma.booking.update({
    where: { id: booking.id },
    data,
  });
}

export function findBookingFirst({ data }): Promise<Booking> {
  return prisma.booking.findFirst({
    where: data,
  });
}

export function isExpired(booking: Booking): boolean {
  return (
    booking.status === "pending" &&
    booking.createdAt.getTime() < Date.now() - TEN_MINUTES
  );
}
