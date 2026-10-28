
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
    params: { status: "active", limit: 100 }
  });

  return extractArray(response.data, ["encounters", "results"]);
}

export async function getNursingRecords(encounterId) {
  const response = await api.get("/nursing-records", {
    params: { encounterId }
  });

  return extractArray(response.data, ["nursingRecords", "records", "results"]);
}

export async function createNursingRecord(payload) {
  const response = await api.post("/nursing-records", payload);
  return response.data;
}
