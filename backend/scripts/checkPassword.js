import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/mongodb/userModel.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evaluation_app';
const DB_NAME = process.env.MONGODB_DB || undefined;

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 });
  const u = await User.findOne({ email: 'admin@example.com' }).lean();
  console.log('User:', { email: u?.email, hasHash: !!u?.passwordHash, estado: u?.estado });
  if (u?.passwordHash) {
    const ok = await bcrypt.compare('Admin#2025!', u.passwordHash);
    console.log('Compare with Admin#2025!:', ok);
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
