
import api from "./api";

function extractArray(body, keys) {
  const candidates = [body, body?.data, body?.results, body?.data?.data];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      for (const key of keys) {
        if (Array.isArray(candidate[key])) return candidate[key];
      }
    }
  }

  return [];
}

export async function getDoctorOrders({ encounterId, status, page = 1, limit = 20 } = {}) {
  const response = await api.get("/doctor-orders", {
    params: {
      ...(encounterId ? { encounterId } : {}),
      ...(status ? { status } : {}),
      page,
      limit
    }
  });

  return {
    orders: extractArray(response.data, ["orders", "doctorOrders", "results"]),
    raw: response.data
  };
}

export async function createDoctorOrder(payload) {
  const response = await api.post("/doctor-orders", payload);
  return response.data;
}

export async function authenticateDoctorOrder(orderId) {
  const response = await api.post(`/doctor-orders/${orderId}/authenticate`);
  return response.data;
}

export async function acknowledgeDoctorOrder(orderId, payload) {
  const response = await api.post(`/doctor-orders/${orderId}/acknowledge`, payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  const body = response.data;

  return body.data?.user ?? body.data ?? body.user ?? body;
}
