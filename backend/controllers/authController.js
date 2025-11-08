import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/mongodb/userModel.js';
import { Session, Log } from '../models/mongodb/sessionModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

// Firma de token
function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// LOGIN
export async function login(req, res) {
  try {
    console.log('[auth.login] body recibido:', req.body);
    const { email, password } = req.body || {};
    const normEmail = email?.toLowerCase().trim();
    if (!normEmail || !password) {
      return res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email: normEmail }).lean();
    console.log('[auth.login] usuario encontrado:', user ? { _id: user._id, email: user.email, tieneHash: !!user.passwordHash, estado: user.estado } : null);
    // Permitir usuarios sin campo 'estado' (migraciones antiguas): trátalos como activos
    const isActive = user?.estado ? user.estado === 'activo' : true;
    if (!user || !isActive) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas (no activo / no existe)' });
    }

    let valid = false;
    if (user.passwordHash) {
      console.log('[auth.login] intentando bcrypt.compare...');
      valid = await bcrypt.compare(password, user.passwordHash);
      console.log('[auth.login] resultado compare:', valid);
    } else if (user.password) {
      console.log('[auth.login] password plano detectado');
      valid = password === user.password;
      if (valid) {
        bcrypt.hash(password, 10).then(hash =>
          User.updateOne({ _id: user._id }, { $set: { passwordHash: hash }, $unset: { password: '' } }).catch(() => {})
        );
      }
    } else {
      console.log('[auth.login] usuario sin password ni passwordHash');
    }

    if (!valid) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas (hash mismatch)' });
    }

    const token = signToken(user);

    Session?.create({
      userId: user._id,
      email: user.email,
      token,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }).catch(() => {});

    Log?.create({
      action: 'login',
      endpoint: '/api/auth/login',
      method: 'POST',
      statusCode: 200,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: { email: user.email }
    }).catch(() => {});

    const { passwordHash, password: _p, __v, ...safe } = user;
    return res.json({ success: true, user: safe, token });
  } catch (err) {
    console.error('auth.login error:', err?.message || err);
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
}

// REGISTER
export async function register(req, res) {
  try {
    let { name, email, password, role } = req.body || {};
    email = email?.toLowerCase().trim();
    // Permitir solo UN admin: si ya existe un admin en la colección, forzar role='user'
    if (role === 'admin') {
      let adminExists = false;
      try {
        adminExists = !!(await User.exists({ role: 'admin' }));
      } catch (e) {
        console.warn('[register] error comprobando adminExists:', e?.message || e);
      }
      if (adminExists) {
        role = 'user';
      } else {
        role = 'admin';
      }
    } else {
      role = 'user';
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nombre, email y contraseña son requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password mínimo 6 caracteres' });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email ya registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await User.create({ name, email, passwordHash, role, estado: 'activo' });
    const token = signToken(created.toJSON());
    // crear sesión y log en background
    Session?.create({
      userId: created._id,
      email: created.email,
      token,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }).catch(() => {});
    Log?.create({
      action: 'user_registered',
      endpoint: '/api/auth/register',
      method: 'POST',
      statusCode: 201,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: { email, role }
    }).catch(() => {});
    const safe = created.toJSON();
    delete safe.passwordHash;
    return res.status(201).json({ success: true, user: safe, token, message: 'Usuario registrado' });
  } catch (err) {
    console.error('auth.register:', err?.message || err);
    if (err?.code === 11000) { // duplicate key error Mongo
      return res.status(409).json({ success: false, error: 'Email ya registrado' });
    }
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
}

// GET USERS
export async function getUsers(_req, res) {
  try {
    const users = await User.find({}, '-passwordHash -password -__v').lean();
    return res.json({ success: true, users, total: users.length });
  } catch (err) {
    console.error('auth.getUsers:', err);
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
}

// UPDATE USER
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.email) updates.email = updates.email.toLowerCase().trim();
    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password mínimo 6' });
      }
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    delete updates._id;

    const updated = await User.findByIdAndUpdate(id, updates, { new: true, projection: '-passwordHash -password -__v' });
    if (!updated) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    Log?.create({
      action: 'user_updated',
      endpoint: `/api/auth/users/${id}`,
      method: 'PUT',
      statusCode: 200,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: { userId: id, updates }
    }).catch(() => {});

    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error('auth.updateUser:', err);
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
}

// DELETE (desactivar)
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { estado: 'desactivado' }, { new: true, projection: '-passwordHash -password -__v' });
    if (!updated) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

    Log?.create({
      action: 'user_deactivated',
      endpoint: `/api/auth/users/${id}`,
      method: 'DELETE',
      statusCode: 200,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: { userId: id }
    }).catch(() => {});

    return res.json({ success: true, message: 'Usuario desactivado', user: updated });
  } catch (err) {
    console.error('auth.deleteUser:', err);
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
}

// LOGOUT
export async function logout(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      Session?.deleteOne({ token }).catch(() => {});
      Log?.create({
        action: 'logout',
        endpoint: '/api/auth/logout',
        method: 'POST',
        statusCode: 200,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: { token }
      }).catch(() => {});
    }
    return res.json({ success: true, message: 'Sesión cerrada' });
  } catch (err) {
    console.error('auth.logout:', err);
    return res.status(500).json({ success: false, error: 'Error al cerrar sesión' });
  }
}

// DEBUG USER (solo desarrollo)
export async function debugUser(req, res) {
  try {
    const email = (req.query.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ success: false, error: 'email requerido' });
    const user = await User.findOne({ email }).lean();
    return res.json({ success: true, user });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'error' });
  }
}

// ME - verifica token
export async function me(req, res) {
  try {
    // req.user viene del middleware auth
    const payload = req.user;
    if (!payload?.email) return res.status(400).json({ success: false, error: 'Token sin email' });
    const user = await User.findOne({ email: payload.email.toLowerCase() }, '-passwordHash -password -__v').lean();
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    return res.json({ success: true, user });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
}