// Centraliza la URL base del API para frontend
// Usa variable de entorno Vite si está definida; si no, fallback
// Puedes definir VITE_API_URL en .env.development o .env

export const API_BASE_URL =
	(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
		? import.meta.env.VITE_API_URL
		: '/api';

export default {
	API_BASE_URL,
};

