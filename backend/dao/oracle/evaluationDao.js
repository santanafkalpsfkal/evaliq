import { execute } from '../../oracle.js';

// Tabla asumida: EVALUATIONS (ID, TITLE, DESCRIPTION, STATUS, CREATED_AT, UPDATED_AT)
// Tabla puente opcional: EVALUATION_ASSIGNMENTS (EVALUATION_ID, USER_ID)

export async function listEvaluations({ search } = {}) {
  let sql = `SELECT ID, TITLE, DESCRIPTION, STATUS, CREATED_AT, UPDATED_AT FROM EVALUATIONS`;
  const binds = {};
  if (search) {
    sql += ` WHERE LOWER(TITLE) LIKE :q OR LOWER(DESCRIPTION) LIKE :q`;
    binds.q = `%${search.toLowerCase()}%`;
  }
  sql += ' ORDER BY CREATED_AT DESC';
  const { rows = [] } = await execute(sql, binds);
  return rows.map(mapEvaluation);
}

export async function getEvaluationById(id) {
  const { rows = [] } = await execute(
    `SELECT ID, TITLE, DESCRIPTION, STATUS, CREATED_AT, UPDATED_AT FROM EVALUATIONS WHERE ID = :id`,
    { id }
  );
  return rows[0] ? mapEvaluation(rows[0]) : null;
}

export async function createEvaluation({ title, description, status = 'draft' }) {
  await execute(
    `INSERT INTO EVALUATIONS (TITLE, DESCRIPTION, STATUS, CREATED_AT, UPDATED_AT)
     VALUES (:title, :description, :status, SYSTIMESTAMP, SYSTIMESTAMP)`,
    { title, description, status },
    { autoCommit: true }
  );
  // Recupera el último insert por título; idealmente usar secuencia y RETURNING INTO
  const { rows = [] } = await execute(
    `SELECT ID, TITLE, DESCRIPTION, STATUS, CREATED_AT, UPDATED_AT FROM EVALUATIONS WHERE TITLE = :title ORDER BY CREATED_AT DESC`,
    { title }
  );
  return rows[0] ? mapEvaluation(rows[0]) : null;
}

export async function updateEvaluation(id, updates = {}) {
  const fields = [];
  const binds = { id };
  if (updates.title !== undefined) { fields.push('TITLE = :title'); binds.title = updates.title; }
  if (updates.description !== undefined) { fields.push('DESCRIPTION = :description'); binds.description = updates.description; }
  if (updates.status !== undefined) { fields.push('STATUS = :status'); binds.status = updates.status; }
  if (!fields.length) return getEvaluationById(id);
  const sql = `UPDATE EVALUATIONS SET ${fields.join(', ')}, UPDATED_AT = SYSTIMESTAMP WHERE ID = :id`;
  await execute(sql, binds, { autoCommit: true });
  return getEvaluationById(id);
}

export async function removeEvaluation(id) {
  await execute(`DELETE FROM EVALUATIONS WHERE ID = :id`, { id }, { autoCommit: true });
  return { id };
}

export async function assignEvaluation(evaluationId, users = []) {
  // Inserta asignaciones (simplificado; limpiar duplicados según necesidad)
  for (const userId of users) {
    await execute(
      `INSERT INTO EVALUATION_ASSIGNMENTS (EVALUATION_ID, USER_ID) VALUES (:evaluationId, :userId)`,
      { evaluationId, userId },
      { autoCommit: true }
    );
  }
  return { evaluationId, assigned: users.length };
}

function mapEvaluation(row) {
  return {
    id: row.ID,
    title: row.TITLE,
    description: row.DESCRIPTION,
    status: row.STATUS,
    createdAt: row.CREATED_AT,
    updatedAt: row.UPDATED_AT
  };
}
