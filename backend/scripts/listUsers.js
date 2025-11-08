import mongoose from 'mongoose';
import { User } from '../models/mongodb/userModel.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evaliq';
const DB_NAME = process.env.MONGODB_DB || undefined;

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 });
  const users = await User.find({}, { email: 1, name: 1, estado: 1, passwordHash: 1 }).lean();
  console.log('Usuarios:', users.map(u => ({ email: u.email, estado: u.estado, hasHash: !!u.passwordHash })));
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
