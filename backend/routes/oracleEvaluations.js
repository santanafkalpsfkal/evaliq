import express from 'express';
import auth from '../middleware/authMiddleware.js';
import {
  listEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  removeEvaluation,
  assignEvaluation
} from '../dao/oracle/evaluationDao.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await listEvaluations({ search: req.query.search });
    res.json({ success: true, items, total: items.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle listando evaluaciones' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const evaluation = await getEvaluationById(req.params.id);
    if (!evaluation) return res.status(404).json({ success: false, error: 'Evaluación no encontrada' });
    res.json({ success: true, evaluation });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle obteniendo evaluación' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const created = await createEvaluation(req.body || {});
    res.status(201).json({ success: true, evaluation: created });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle creando evaluación' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await updateEvaluation(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ success: false, error: 'Evaluación no encontrada' });
    res.json({ success: true, evaluation: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle actualizando evaluación' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await removeEvaluation(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle eliminando evaluación' });
  }
});

router.post('/:id/assign', auth, async (req, res) => {
  try {
    const { users = [] } = req.body || {};
    const out = await assignEvaluation(req.params.id, users);
    res.json({ success: true, ...out });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message || 'Error Oracle asignando evaluación' });
  }
});

export default router;
