
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

export async function getActiveEncounters() {
  const response = await api.get("/encounters", {
    params: { status: "active", limit: 100 },
  });

  return extractArray(response.data, ["encounters", "results"]);
}

export async function getHandovers({ status, page = 1, limit = 20 } = {}) {
  const response = await api.get("/handovers", {
    params: {
      ...(status ? { status } : {}),
      page,
      limit,
    },
  });

  return {
    handovers: extractArray(response.data, ["handovers", "results"]),
    raw: response.data,
  };
}

export async function createHandover(payload) {
  const response = await api.post("/handovers", payload);
  return response.data;
}

export async function submitHandover(handoverId) {
  const response = await api.post(`/handovers/${handoverId}/submit`);
  return response.data;
}

export async function acknowledgeHandover(handoverId, payload = {}) {
  const response = await api.post(
    `/handovers/${handoverId}/acknowledge`,
    payload
  );

  return response.data;
}
