import { execute } from '../../oracle.js';

// Tabla asumida: USERS (ID NUMBER generated or VARCHAR2), NAME, EMAIL, ROLE, ESTADO, CREATED_AT, UPDATED_AT
// Nota: Adaptar nombres de columnas según su esquema real.

export async function listUsers({ search } = {}) {
  let sql = `SELECT ID, NAME, EMAIL, ROLE, ESTADO, CREATED_AT, UPDATED_AT FROM USERS`;
  const binds = {};
  if (search) {
    sql += ` WHERE LOWER(NAME) LIKE :q OR LOWER(EMAIL) LIKE :q`;
    binds.q = `%${search.toLowerCase()}%`;
  }
  sql += ' ORDER BY CREATED_AT DESC';
  const { rows = [] } = await execute(sql, binds);
  return rows.map(mapUser);
}

export async function getUserById(id) {
  const { rows = [] } = await execute(
    `SELECT ID, NAME, EMAIL, ROLE, ESTADO, CREATED_AT, UPDATED_AT FROM USERS WHERE ID = :id`,
    { id }
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function getUserByEmail(email) {
  const { rows = [] } = await execute(
    `SELECT ID, NAME, EMAIL, ROLE, ESTADO, CREATED_AT, UPDATED_AT FROM USERS WHERE LOWER(EMAIL) = :email`,
    { email: email.toLowerCase() }
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function createUser({ name, email, role = 'user', estado = 'activo' }) {
  const { rowsAffected } = await execute(
    `INSERT INTO USERS (NAME, EMAIL, ROLE, ESTADO, CREATED_AT, UPDATED_AT)
     VALUES (:name, :email, :role, :estado, SYSTIMESTAMP, SYSTIMESTAMP)`,
    { name, email: email.toLowerCase(), role, estado },
    { autoCommit: true }
  );
  if (!rowsAffected) return null;
  return getUserByEmail(email);
}

export async function updateUserById(id, updates = {}) {
  const fields = [];
  const binds = { id };
  if (updates.name !== undefined) { fields.push('NAME = :name'); binds.name = updates.name; }
  if (updates.email !== undefined) { fields.push('EMAIL = :email'); binds.email = updates.email.toLowerCase(); }
  if (updates.role !== undefined) { fields.push('ROLE = :role'); binds.role = updates.role; }
  if (updates.estado !== undefined) { fields.push('ESTADO = :estado'); binds.estado = updates.estado; }
  if (!fields.length) return getUserById(id);
  const sql = `UPDATE USERS SET ${fields.join(', ')}, UPDATED_AT = SYSTIMESTAMP WHERE ID = :id`;
  await execute(sql, binds, { autoCommit: true });
  return getUserById(id);
}

export async function deactivateUser(id) {
  await execute(`UPDATE USERS SET ESTADO = 'desactivado', UPDATED_AT = SYSTIMESTAMP WHERE ID = :id`, { id }, { autoCommit: true });
  return getUserById(id);
}

function mapUser(row) {
  return {
    id: row.ID,
    name: row.NAME,
    email: row.EMAIL,
    role: row.ROLE,
    estado: row.ESTADO,
    createdAt: row.CREATED_AT,
    updatedAt: row.UPDATED_AT
  };
}
