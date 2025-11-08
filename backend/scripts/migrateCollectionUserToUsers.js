import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evaliq';
const DB_NAME = process.env.MONGODB_DB || undefined;

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  const from = db.collection('user');
  const to = db.collection('users');

  const docs = await from.find({}).toArray();
  console.log('Encontrados en user:', docs.length);
  for (const d of docs) {
    const email = (d.email || '').toLowerCase().trim();
    if (!email) continue;
    const update = { ...d };
    // Normaliza estado
    if (!update.estado) update.estado = 'activo';
    // Asegura campos que no deben copiarse crudos
    delete update._id; // evitamos conflicto de _id
    await to.updateOne(
      { email },
      { $set: update },
      { upsert: true }
    );
    console.log('Upsert:', email);
  }
  console.log('Migración completada.');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
