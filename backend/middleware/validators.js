import { body, validationResult } from 'express-validator';

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

export const validateLogin = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('Password mínimo 6'),
  handleValidation
];

export const validateRegister = [
  body('name').isString().trim().isLength({ min: 2 }).withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('Password mínimo 6'),
  handleValidation
];