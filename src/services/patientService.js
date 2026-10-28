
import api from "./api";

export async function getPatients({ search = "", page = 1, limit = 10 } = {}) {
  const response = await api.get("/patients", {
    params: {
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {})
    }
  });

  const body = response.data;
  const payload = body.data ?? body;

  const patients = Array.isArray(payload)
    ? payload
    : payload.patients ?? payload.results ?? [];

  return {
    patients,
    pagination: body.pagination ?? payload.pagination ?? {
      page,
      limit,
      total: patients.length,
      totalPages: 1
    }
  };
}

export async function getPatientById(patientId) {
  const response = await api.get(`/patients/${patientId}`);
  const body = response.data;

  return body.data?.patient ?? body.data ?? body.patient ?? body;
}