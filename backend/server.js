import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Oracle eliminado - migración completa a MongoDB

dotenv.config();
console.log('🔧 [Server] Iniciando servidor...');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`🌐 [Server] ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas base siempre disponibles
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API funcionando', timestamp: new Date().toISOString() });
});

app.post('/api/auth/test-login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@evaliq.com' && password === 'Admin#2025!') {
    return res.json({
      success: true,
      user: { id: 1, name: 'Administrador Principal', email: 'admin@evaliq.com', role: 'admin' },
      token: 'test-token-123'
    });
  }
  res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
});

// Init
async function init() {
  let server;
  try {
    // Mongo
    try {
      console.log('🔄 [Server] Intentando importar MongoDB config...');
      const mongoMod = await import('./config/mongodb.js');
      if (mongoMod.connectMongoDB) await mongoMod.connectMongoDB();
      console.log('✅ [Server] Conectado a MongoDB');
      app.get('/api/health', async (req, res) => {
        try {
          const stats = mongoMod.getMongoDBStats ? await mongoMod.getMongoDBStats() : { status: 'unknown' };
          res.json({ status: 'OK', mongodb: stats, timestamp: new Date().toISOString() });
        } catch {
          res.status(500).json({ status: 'ERROR', mongodb: 'error' });
        }
      });
    } catch (e) {
      console.error('💥 [Server] ERROR MongoDB:', e.message);
      app.get('/api/health', (_req, res) => res.json({ status: 'OK', mongodb: 'not-connected' }));
    }

    // (Oracle omitido)

    // Auth routes
    try {
      console.log('🔄 [Server] Intentando importar authRoutes...');
      const authRoutes = await import('./routes/auth.js');
      app.use('/api/auth', authRoutes.default || authRoutes);
      console.log('✅ [Server] Rutas de auth configuradas en /api/auth');
    } catch (e) {
      console.error('💥 [Server] ERROR importando authRoutes:', e);
    }

    // Evaluation routes Mongo
    try {
      console.log('🔄 [Server] Importando evaluationRoutes...');
      const evalRoutes = await import('./routes/evaluations.js');
      app.use('/api/evaluations', evalRoutes.default || evalRoutes);
      console.log('✅ [Server] Rutas de evaluaciones configuradas en /api/evaluations');
    } catch (e) {
      console.error('💥 [Server] ERROR importando evaluationRoutes:', e);
    }

    // 404 y error handler (después de montar rutas)
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ success: false, error: 'Ruta no encontrada', path: req.originalUrl });
      }
      next();
    });

    app.use((err, req, res, next) => {
      console.error('💥 [Server] Error global:', err);
      res.status(err.status || 500).json({ success: false, error: 'Error interno del servidor' });
    });

    // Escucha con reintentos si el puerto está en uso
    const startServer = (port, retries = 3) => {
      const srv = app.listen(port, () => {
        console.log(`🎉 [Server] Servidor corriendo en http://localhost:${port}`);
      });
      srv.on('error', err => {
        if (err.code === 'EADDRINUSE' && retries > 0) {
          console.warn(`⚠️  Puerto ${port} en uso. Reintentando en ${port + 1} (retries restantes: ${retries - 1})`);
          startServer(port + 1, retries - 1);
        } else {
          console.error('💥 [Server] Error al iniciar servidor:', err);
          process.exit(1);
        }
      });
      return srv;
    };

    server = startServer(Number(PORT));

  } catch (err) {
    console.error('💥 [Server] Error durante arranque:', err);
    process.exit(1);
  }
}

init();