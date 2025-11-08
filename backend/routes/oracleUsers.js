import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { listUsers, getUserById, createUser, updateUserById, deactivateUser } from '../dao/oracle/userDao.js';

const router = express.Router();

// Listar usuarios
router.get('/', auth, async (req, res) => {
  try {
    const users = await listUsers({ search: req.query.search });
    res.json({ success: true, users, total: users.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle listando usuarios' });
  }
});

// Obtener por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle obteniendo usuario' });
  }
});

// Crear
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, role, estado } = req.body || {};
    if (!name || !email) return res.status(400).json({ success: false, error: 'name y email son requeridos' });
    const created = await createUser({ name, email, role, estado });
    res.status(201).json({ success: true, user: created });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle creando usuario' });
  }
});

// Actualizar
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await updateUserById(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.json({ success: true, user: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle actualizando usuario' });
  }
});

// Desactivar
router.delete('/:id', auth, async (req, res) => {
  try {
    const updated = await deactivateUser(req.params.id);
    if (!updated) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.json({ success: true, message: 'Usuario desactivado', user: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle desactivando usuario' });
  }
});

export default router;
