import axios from "axios";
import { createApi } from "./teacherService";

const api = createApi();

export async function getScheduledBookings(data) {
  const res = await api.get(`/api/bookings/reschedule?${data}`);
  return res.data;
}

export async function updateScheduledBookings(payload) {
  return axios.put("/api/bookings/reschedule", payload);
}
