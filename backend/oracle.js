import oracledb from 'oracledb';

// Configuración para desarrollo
const dbConfig = {
  user: 'evaluation_user',
  password: 'evaluation123', 
  connectString: 'localhost:1521/XE',
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 2
};

export async function initializeOracle() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✅ Oracle Database conectada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a Oracle:', error.message);
    return false;
  }
}

export async function getOracleConnection() {
  try {
    return await oracledb.getConnection();
  } catch (error) {
    console.error('Error obteniendo conexión Oracle:', error);
    throw error;
  }
}

export async function closeOraclePool() {
  try {
    await oracledb.getPool()?.close(0);
    console.log('🔌 Oracle pool cerrado');
  } catch (e) {
    console.warn('No se pudo cerrar el pool de Oracle:', e?.message || e);
  }
}

// Helper para ejecutar consultas con manejo de recursos
export async function execute(query, binds = {}, options = {}) {
  const conn = await getOracleConnection();
  try {
    const execOptions = { outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: options.autoCommit ?? false };
    const result = await conn.execute(query, binds, execOptions);
    if (options.autoCommit) await conn.commit();
    return result;
  } finally {
    try { await conn.close(); } catch {}
  }
}

export async function healthOracle() {
  try {
    const pool = oracledb.getPool();
    return { connected: true, openConnections: pool.connectionsOpen, busyConnections: pool.connectionsInUse };
  } catch (e) {
    return { connected: false, error: e?.message || String(e) };
  }
}