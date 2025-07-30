import axios from "axios";

export const api = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      : "",
  headers: { "Content-Type": "application/json" },
});

export async function fetchTeacherAvailability(teacherId: string) {
  const response = await api.post("/api/teachers/availability", {
    teacherId,
  });

  return response.data;
}

export const getTeacherAvailability = async () => {
  const res = await axios.get("/api/teachers/me/availability");
  return res.data;
};

export const getTeacherProfile = async () => {
  const res = await axios.get("/api/teachers/me");
  return res.data;
};
