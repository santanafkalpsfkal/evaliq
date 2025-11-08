import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evaliq';
const DB_NAME = process.env.MONGODB_DB || undefined;

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 });
  const col = mongoose.connection.db.collection('users');

  const mapping = {
    'admin@example.com': 'Admin#2025!',
    'user@example.com': 'User#2025!'
  };

  const users = await col.find({}).toArray();
  for (const u of users) {
    const plain = mapping[u.email] || 'Temp#123!';
    const hash = await bcrypt.hash(plain, 10);
    await col.updateOne(
      { _id: u._id },
      { $set: { passwordHash: hash, estado: 'activo' }, $unset: { password: "" } }
    );
    console.log('Migrado:', u.email);
  }

  await mongoose.disconnect();
  console.log('Listo. Usa las nuevas contraseñas definidas en mapping.');
}

run().catch(e => { console.error(e); process.exit(1); });