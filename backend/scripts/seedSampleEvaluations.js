import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/mongodb/userModel.js';
import { Evaluation } from '../models/mongodb/evaluationModel.js';
import { connectMongoDB, closeMongoDB } from '../config/mongodb.js';

async function run() {
  try {
  await connectMongoDB();
  const email = 'tester@example.com';
    const name = 'Sample Tester';
    const existing = await User.findOne({ email });
    let user = existing;
    if (!user) {
      const passwordHash = await bcrypt.hash('Test1234*', 10);
      user = await User.create({ name, email, passwordHash, role: 'user' });
      console.log(`Created sample user ${email} (password: Test1234*)`);
    } else {
      console.log(`Using existing sample user ${email}`);
    }

    const samples = [
      {
        projectName: 'Duolingo Mobile UX',
        comments: 'Evaluación de usabilidad y gamificación. Flujo de lecciones intuitivo.',
        scores: { functionality: 5, reliability: 4, usability: 5, efficiency: 4, maintainability: 4 }
      },
      {
        projectName: 'LinkedIn Networking Module',
        comments: 'Verificación de feed y recomendaciones. Algoritmo consistente.',
        scores: { functionality: 4, reliability: 5, usability: 4, efficiency: 4, maintainability: 3 }
      },
      {
        projectName: 'CDigital Payment Gateway',
        comments: 'Procesamiento de transacciones rápido y seguro, buen manejo de errores.',
        scores: { functionality: 5, reliability: 5, usability: 4, efficiency: 5, maintainability: 3 }
      },
      {
        projectName: 'Plataforma EduTech Analytics',
        comments: 'Panel de métricas con algunos retrasos en carga inicial.',
        scores: { functionality: 4, reliability: 4, usability: 4, efficiency: 3, maintainability: 4 }
      }
    ];

    for (const s of samples) {
      const totalScore = Object.values(s.scores).reduce((a, b) => a + b, 0);
      const exists = await Evaluation.findOne({ userId: user._id, projectName: s.projectName, deletedAt: null });
      if (exists) {
        console.log(`Skipping existing evaluation: ${s.projectName}`);
        continue;
      }
      const ev = await Evaluation.create({
        userId: user._id,
        evaluatorName: user.name,
        evaluatorEmail: user.email,
        projectName: s.projectName,
        comments: s.comments,
        scores: s.scores,
        totalScore,
        status: 'submitted'
      });
      console.log(`Created evaluation: ${ev.projectName} (totalScore=${totalScore})`);
    }

    console.log('Sample evaluations seeding complete.');
    await closeMongoDB();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding sample evaluations', err);
    try { await closeMongoDB(); } catch {}
    process.exit(1);
  }
}

run();
