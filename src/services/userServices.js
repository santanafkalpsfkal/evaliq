// src/services/userServices.js
export const userServices = {
  async login(email, password) {
    const users = [
      {
        email: "admin@evaliq.com",
        password: "Admin#2025!",
        name: "Administrador",
        role: "admin",
      },
      {
        email: "user@evaliq.com",
        password: "User#2025!",
        name: "Usuario EvaliQ",
        role: "user",
      },
    ];

    const found = users.find(
      (u) => u.email === email && u.password === password
    );

    if (found) return { success: true, user: found };
    return { success: false, message: "Credenciales inválidas" };
  },
};
