import axios from "axios";

export function createApi() {
  return axios.create({
    baseURL:
      typeof window === "undefined" ? process.env.NEXT_PUBLIC_BASE_URL : "",
    headers: { "Content-Type": "application/json" },
  });
}

const api = createApi();

export async function fetchTeacherAvailability(
  teacherId: string,
  weeks?: number,
  signal?: AbortSignal
) {
  const response = await api.post(
    "/api/teachers/availability",
    { teacherId, weeks },
    { signal }
  );
  return response.data;
}

export async function saveTeacherAvailability(data) {
  const response = await api.post("/api/teachers/me/availability", data);
  return response.data;
}

export async function getTeacherAvailability() {
  const response = await api.get("/api/teachers/me/availability");
  return response.data;
}

export async function getTeacherProfile() {
  const response = await api.get("/api/teachers/me");
  return response.data;
}

export async function generatePublicLink(price: number, currency: string) {
  const response = await api.post("/api/teachers/me/public-link", {
    price,
    currency,
  });
  return response.data;
}

export async function getTeacherPublicLink() {
  const res = await api.get("/api/teachers/me/public-link");
  return res.data;
}

export async function updateTeacherProfile(data) {
  const res = await api.put("/api/teachers/me/update-profile", data);
  return res.data;
}

export async function saveTeacherPaymentConfig(paymentConfig) {
  const response = await api.post("/api/teachers/me/payment-config", {
    ...paymentConfig,
  });
  return response.data;
}

export async function getTeacherPaymentConfig() {
  const response = await api.get("/api/teachers/me/payment-config");
  const { paymentConfig } = response.data;
  return paymentConfig;
}

export async function fetchBanks() {
  const response = await api.get("https://brasilapi.com.br/api/banks/v1");
  return response.data;
}
