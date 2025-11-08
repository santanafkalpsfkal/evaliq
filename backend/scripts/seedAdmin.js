import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/mongodb/userModel.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evaluation_app';
const DB_NAME = process.env.MONGODB_DB || undefined;

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 });

  const email = process.env.DEBUG_ADMIN_EMAIL || 'admin@evaliq.com';
  const name = 'Administrador Principal';
  const password = process.env.DEBUG_ADMIN_PASSWORD || 'Admin#2025!';

  let admin = await User.findOne({ email });
  if (!admin) {
    const passwordHash = await bcrypt.hash(password, 10);
    admin = await User.create({ name, email, passwordHash, role: 'admin', estado: 'activo' });
    console.log('Admin creado:', admin.email);
  } else {
    console.log('Admin ya existe:', admin.email);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});