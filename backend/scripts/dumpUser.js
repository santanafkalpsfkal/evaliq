import mongoose from 'mongoose';
import { User } from '../models/mongodb/userModel.js';

const email = process.argv[2] || 'admin@example.com';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evaliq';
const DB_NAME = process.env.MONGODB_DB || undefined;

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 });
  const doc = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  console.log('RAW USER DOC:', doc);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
