import { prisma } from "@/lib/prisma";
import { Booking } from "@prisma/client";

const TEN_MINUTES = 10 * 60 * 1000;

export function findBooking(id): Promise<Booking> {
  return prisma.booking.findUnique({
    where: { id },
  });
}

export function createBooking({ bookingData, bookingDate, status, notes }) {
  return prisma.booking.create({
    data: {
      teacherId: bookingData.teacherId,
      studentName: bookingData.metadata.studentName,
      studentEmail: bookingData.studentEmail,
      date: bookingDate,
      time: bookingData.metadata.time,
      amount: bookingData.amount,
      currency: bookingData.currency,
      status,
      notes,
    },
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
