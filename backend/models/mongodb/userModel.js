import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user', index: true },
    estado: { type: String, enum: ['activo', 'desactivado'], default: 'activo' }
  },
  {
    timestamps: true,
    collection: 'users' // ajustado a la colección real 'users'
  }
);

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
