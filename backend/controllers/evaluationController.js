import { Evaluation } from '../models/mongodb/evaluationModel.js';
import { User } from '../models/mongodb/userModel.js';

// Helpers
function isAdmin(req) { return req?.user?.role === 'admin'; }

// List: admins see all, users see own
export async function listEvaluations(req, res) {
  try {
    const query = isAdmin(req) ? { deletedAt: null } : { userId: req.user.id, deletedAt: null };
    const items = await Evaluation.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, items, total: items.length });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'Error listando evaluaciones' });
  }
}

export async function getEvaluation(req, res) {
  try {
    const { id } = req.params;
    const ev = await Evaluation.findById(id).lean();
    if (!ev || ev.deletedAt) return res.status(404).json({ success: false, error: 'No encontrada' });
    if (!isAdmin(req) && String(ev.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Prohibido' });
    }
    return res.json({ success: true, evaluation: ev });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'Error obteniendo evaluación' });
  }
}

export async function createEvaluation(req, res) {
  try {
  const { projectName, comments, scores } = req.body || {};
    if (!projectName) return res.status(400).json({ success: false, error: 'projectName requerido' });
    const totalScore = Object.values(scores || {}).reduce((s, v) => s + (Number(v) || 0), 0);
    // Obtener datos del evaluador (nombre) desde Mongo si es posible
    let evaluatorName = req.user.email;
    try {
      const u = await User.findById(req.user.id).lean();
      if (u?.name) evaluatorName = u.name;
    } catch {}

    const payload = {
      userId: req.user.id,
      evaluatorName,
      evaluatorEmail: req.user.email,
      projectName,
      comments,
      scores: scores || {},
      totalScore,
      status: 'submitted'
    };
    const created = await Evaluation.create(payload);
    return res.status(201).json({ success: true, evaluation: created });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'Error creando evaluación' });
  }
}

export async function updateEvaluation(req, res) {
  try {
    const { id } = req.params;
    const ev = await Evaluation.findById(id);
    if (!ev || ev.deletedAt) return res.status(404).json({ success: false, error: 'No encontrada' });
    if (!isAdmin(req) && String(ev.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Prohibido' });
    }
    const updates = { ...req.body };
    if (updates.scores) {
      updates.totalScore = Object.values(updates.scores).reduce((s, v) => s + (Number(v) || 0), 0);
    }
    const updated = await Evaluation.findByIdAndUpdate(id, updates, { new: true });
    return res.json({ success: true, evaluation: updated });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'Error actualizando evaluación' });
  }
}

export async function deleteEvaluation(req, res) {
  try {
    const { id } = req.params;
    const ev = await Evaluation.findById(id);
    if (!ev || ev.deletedAt) return res.status(404).json({ success: false, error: 'No encontrada' });
    if (!isAdmin(req) && String(ev.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Prohibido' });
    }
    ev.deletedAt = new Date();
    await ev.save();
    return res.json({ success: true, id });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'Error eliminando evaluación' });
  }
}

// Asignación (admin)
export async function assignEvaluation(req, res) {
  try {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'Solo admin' });
    const { id } = req.params;
    const { users = [] } = req.body || {};
    const updated = await Evaluation.findByIdAndUpdate(
      id,
      { $addToSet: { assignedTo: { $each: users } } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: 'No encontrada' });
    return res.json({ success: true, evaluation: updated, assigned: users.length });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || 'Error asignando evaluación' });
  }
}
