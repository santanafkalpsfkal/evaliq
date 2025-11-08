import express from 'express';
import {
  login,
  getUsers,
  logout,
  register,
  updateUser,
  deleteUser,
  debugUser,
  me
} from '../controllers/authController.js';
import auth from '../middleware/authMiddleware.js';
import { validateLogin, validateRegister } from '../middleware/validators.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/logout', auth, logout);
router.post('/register', validateRegister, register);

router.get('/users', auth, getUsers);
router.put('/users/:id', auth, updateUser);
router.delete('/users/:id', auth, deleteUser);
router.get('/debug-user', debugUser); // sin auth para debug local
router.get('/me', auth, me);

export default router;