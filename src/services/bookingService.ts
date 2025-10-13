import axios from "axios";
import { createApi } from "./teacherService";
import { Booking } from "@prisma/client";

const api = createApi();

export async function getScheduledBookings(data) {
  const res = await api.get(`/api/bookings/reschedule?${data}`);
  return res.data;
}

export async function updateScheduledBookings(payload) {
  return axios.put("/api/bookings/reschedule", payload);
}

export async function getTeacherBookings(
  status?: string,
  limit?: number
): Promise<{
  bookings: Booking[];
}> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (limit) params.append("limit", limit.toString());

  const response = await axios.get(
    `/api/teachers/me/bookings?${params.toString()}`
  );

  return response.data;
}
