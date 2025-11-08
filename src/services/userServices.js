import axios from 'axios';
import { API_BASE_URL } from '../config/config.js';
console.log('[userServices] API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(cfg => { console.log('[userServices] ->', cfg.method?.toUpperCase(), cfg.url); return cfg; });
api.interceptors.response.use(r => { console.log('[userServices] <-', r.status, r.config.url); return r; }, e => { console.log('[userServices] !! error', e.code, e.message); return Promise.reject(e); });

// Interceptor request: siempre devolver config
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // IMPORTANTE: siempre retornar
  },
  (error) => Promise.reject(error)
);

// Interceptor response: limpiar sesión si 401
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

function persistSession(user, token) {
  localStorage.setItem('userData', JSON.stringify(user));
  localStorage.setItem('authToken', token);
  try { window.dispatchEvent(new Event('session-changed')); } catch {}
}

export const userServices = {
  async login(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      if (data?.success && data?.user && data?.token) {
        persistSession(data.user, data.token);
        return { success: true, user: data.user, token: data.token };
      }
      return { success: false, error: data?.error || 'Credenciales inválidas' };
    } catch (err) {
      // Fallback a test-login solo si no hay respuesta del server
      if (!err.response) {
        try {
          const res2 = await api.post('/auth/test-login', { email, password });
            const d2 = res2.data;
            if (d2?.success) {
              persistSession(d2.user, d2.token);
              return { success: true, user: d2.user, token: d2.token, fallback: true };
            }
            return { success: false, error: d2?.error || 'Login fallback fallido' };
        } catch {
          return { success: false, error: 'Servidor no responde' };
        }
      }
      return { success: false, error: err.response?.data?.error || 'Error en login' };
    }
  },

  async register({ name, email, password, skipPersist = false }) {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const data = res.data;
      if (!skipPersist && data?.success && data?.user && data?.token) {
        persistSession(data.user, data.token);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error en registro' };
    }
  },

  async getUsers() {
    try {
      const res = await api.get('/auth/users');
      return res.data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error obteniendo usuarios' };
    }
  },

  async updateUser(id, updates) {
    try {
      const res = await api.put(`/auth/users/${id}`, updates);
      return res.data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error actualizando usuario' };
    }
  },

  async deleteUser(id) {
    try {
      const res = await api.delete(`/auth/users/${id}`);
      return res.data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Error desactivando usuario' };
    }
  },

  logout() {
    // Comportamiento simple: limpiar sesión y marcar aviso
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.setItem('justLoggedOut', '1');
    } catch {}
    return { success: true };
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};