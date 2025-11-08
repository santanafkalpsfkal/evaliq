import mongoose from 'mongoose';

const SRC_URI = process.env.SRC_URI || 'mongodb://localhost:27017/evaluation_app';
const SRC_DB = process.env.SRC_DB || undefined;
const DEST_URI = process.env.DEST_URI || 'mongodb://localhost:27017/evaliq';
const DEST_DB = process.env.DEST_DB || undefined;

async function run() {
  // Conexión origen
  const src = await mongoose.createConnection(SRC_URI, { dbName: SRC_DB, serverSelectionTimeoutMS: 5000 }).asPromise();
  const srcDb = src.db;

  // Conexión destino
  const dest = await mongoose.createConnection(DEST_URI, { dbName: DEST_DB, serverSelectionTimeoutMS: 5000 }).asPromise();
  const destDb = dest.db;

  const from = srcDb.collection('users');
  const to = destDb.collection('users');

  const docs = await from.find({}).toArray();
  console.log('Usuarios a importar desde evaluation_app.users:', docs.length);
  for (const d of docs) {
    const email = (d.email || '').toLowerCase().trim();
    if (!email) continue;
    const update = { ...d };
    delete update._id;
    if (!update.estado) update.estado = 'activo';
    await to.updateOne(
      { email },
      { $set: update },
      { upsert: true }
    );
    console.log('Upsert:', email);
  }

  await src.close();
  await dest.close();
  console.log('Importación completada.');
}

run().catch(e => { console.error(e); process.exit(1); });
