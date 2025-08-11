import axios from "axios";

interface BookingPayload {
  teacherId: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  studentPaymentMethod: string;
}

export async function createBooking(payload: BookingPayload) {
  const response = await axios.post("/api/bookings", payload);
  return response.data;
}
