import axios from 'axios';
import { API_BASE_URL } from '../config/config.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor request: añade Authorization si hay token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: limpia sesión si 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

function ok(data) { return { success: true, ...data }; }
function fail(err, fallbackMsg = 'Error en servicio de evaluaciones') {
  return { success: false, error: err?.response?.data?.error || err?.message || fallbackMsg };
}

export const evaluationServices = {
  // Lista con filtros opcionales: { page, pageSize, status, search }
  async list(params = {}) {
    try {
      const res = await api.get('/evaluations', { params });
      return res.data?.success ? res.data : ok({ items: res.data?.items || [], total: res.data?.total || 0 });
    } catch (err) {
      return fail(err, 'Error obteniendo evaluaciones');
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/evaluations/${id}`);
      return res.data?.success ? res.data : ok({ evaluation: res.data });
    } catch (err) {
      return fail(err, 'Error obteniendo la evaluación');
    }
  },

  async create(payload) {
    // payload: { title, description, questions: [...], metadata... }
    try {
      const res = await api.post('/evaluations', payload);
      return res.data?.success ? res.data : ok({ evaluation: res.data });
    } catch (err) {
      return fail(err, 'Error creando la evaluación');
    }
  },

  async update(id, updates) {
    try {
      const res = await api.put(`/evaluations/${id}`, updates);
      return res.data?.success ? res.data : ok({ evaluation: res.data });
    } catch (err) {
      return fail(err, 'Error actualizando la evaluación');
    }
  },

  async remove(id) {
    try {
      const res = await api.delete(`/evaluations/${id}`);
      return res.data?.success ? res.data : ok({ id });
    } catch (err) {
      return fail(err, 'Error eliminando la evaluación');
    }
  },

  async start(id) {
    try {
      const res = await api.post(`/evaluations/${id}/start`);
      return res.data?.success ? res.data : ok({ started: true });
    } catch (err) {
      return fail(err, 'Error iniciando la evaluación');
    }
  },

  async submit(id, answers) {
    // answers: [{ questionId, value }, ...]
    try {
      const res = await api.post(`/evaluations/${id}/submit`, { answers });
      return res.data?.success ? res.data : ok({ submitted: true, result: res.data });
    } catch (err) {
      return fail(err, 'Error enviando respuestas');
    }
  },

  async getResults(id) {
    try {
      const res = await api.get(`/evaluations/${id}/results`);
      return res.data?.success ? res.data : ok({ results: res.data });
    } catch (err) {
      return fail(err, 'Error obteniendo resultados');
    }
  },

  async assign(id, userIds = []) {
    try {
      const res = await api.post(`/evaluations/${id}/assign`, { users: userIds });
      return res.data?.success ? res.data : ok({ assigned: true });
    } catch (err) {
      return fail(err, 'Error asignando evaluación');
    }
  },

  async addQuestion(evaluationId, question) {
    try {
      const res = await api.post(`/evaluations/${evaluationId}/questions`, question);
      return res.data?.success ? res.data : ok({ question: res.data });
    } catch (err) {
      return fail(err, 'Error agregando pregunta');
    }
  },

  async removeQuestion(evaluationId, questionId) {
    try {
      const res = await api.delete(`/evaluations/${evaluationId}/questions/${questionId}`);
      return res.data?.success ? res.data : ok({ removed: true });
    } catch (err) {
      return fail(err, 'Error eliminando pregunta');
    }
  }
};