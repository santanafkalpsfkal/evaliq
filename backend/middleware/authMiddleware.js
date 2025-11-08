import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Middleware de autenticación: acepta JWT o token temporal 'temp-token-...'
export default function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    if (typeof token === 'string' && token.startsWith('temp-token-')) {
      req.user = { debug: true, token };
      return next();
    }
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
}