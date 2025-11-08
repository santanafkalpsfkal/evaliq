import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evaliq';
const DB_NAME = process.env.MONGODB_DB || undefined;

let isConnected = false;

/**
 * Conecta a MongoDB usando mongoose.
 * Devuelve mongoose.connection.db si conecta correctamente.
 * Lanza error si la conexión falla.
 */
export async function connectMongoDB(options = { serverSelectionTimeoutMS: 5000 }) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection.db;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI no configurado');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options
    });

    isConnected = true;
    console.log('✅ MongoDB conectado correctamente (mongoose)');

    // Listar colecciones si la DB está disponible
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      if (collections && collections.length) {
        console.log('📋 Colecciones disponibles:');
        collections.forEach(col => console.log('   • ' + col.name));
      } else {
        console.log('📋 No se encontraron colecciones (posible DB nueva).');
      }
    } catch (listErr) {
      console.warn('⚠️ No se pudo listar colecciones:', listErr?.message ?? listErr);
    }

    return mongoose.connection.db;
  } catch (err) {
    isConnected = false;
    console.error('❌ Error conectando a MongoDB:', err?.message ?? err);
    throw err;
  }
}

/**
 * Retorna la instancia db (mongoose.connection.db) si está conectada.
 * Lanza error si no hay conexión.
 */
export function getDB() {
  if (!isConnected || mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error('MongoDB no conectado. Llama a connectMongoDB primero.');
  }
  return mongoose.connection.db;
}

/**
 * Devuelve estadísticas simples de la base (counts por colección si existen).
 * No lanza excepción: devuelve { status: 'error', error: msg } en caso de fallo.
 */
export async function getMongoDBStats() {
  try {
    if (!isConnected || !mongoose.connection.db) {
      return { status: 'disconnected' };
    }
    const db = mongoose.connection.db;

    // Comprobar si las colecciones existen antes de contar
    const existing = await db.listCollections().toArray();
    const names = existing.map(c => c.name);

    const safeCount = async (name) => names.includes(name) ? await db.collection(name).countDocuments() : 0;

    const sessionCount = await safeCount('sessions');
    const logCount = await safeCount('logs');
    const metricCount = await safeCount('metrics');

    return {
      status: 'connected',
      sessions: sessionCount,
      logs: logCount,
      metrics: metricCount,
      dbName: db.databaseName
    };
  } catch (err) {
    return { status: 'error', error: err?.message ?? err };
  }
}

/**
 * Cierra la conexión mongoose.
 */
export async function closeMongoDB() {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('🛑 MongoDB desconectado correctamente');
    }
  } catch (err) {
    console.error('❌ Error cerrando MongoDB:', err?.message ?? err);
  }
}