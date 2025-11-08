import express from 'express';
import auth from '../middleware/authMiddleware.js';
import {
  listEvaluations,
  getEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  assignEvaluation
} from '../controllers/evaluationController.js';

const router = express.Router();

router.get('/', auth, listEvaluations);
router.get('/:id', auth, getEvaluation);
router.post('/', auth, createEvaluation);
router.put('/:id', auth, updateEvaluation);
router.delete('/:id', auth, deleteEvaluation);
router.post('/:id/assign', auth, assignEvaluation);

export default router;
