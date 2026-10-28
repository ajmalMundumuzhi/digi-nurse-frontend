
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

export async function getCarePlans({ encounterId, status, page = 1, limit = 20 } = {}) {
  const response = await api.get("/care-plans", {
    params: {
      ...(encounterId ? { encounterId } : {}),
      ...(status ? { status } : {}),
      page,
      limit
    }
  });

  return {
    plans: extractArray(response.data, ["carePlans", "plans", "results"]),
    raw: response.data
  };
}

export async function createCarePlan(payload) {
  const response = await api.post("/care-plans", payload);
  return response.data;
}
