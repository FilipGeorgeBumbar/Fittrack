import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schema.js';
import workoutRoutes from './routes/workouts.js';
import { initializeSocket } from './socket.js';
import { startSimulation, stopSimulation, isSimulationRunning } from './simulation.js';
import authRoutes from './routes/auth.js';
import { authenticateRequest } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

function buildServer() {
  const useHttps =
    process.env.NODE_ENV !== 'test' &&
    process.env.USE_HTTP !== 'true';

  if (!useHttps) {
    return http.createServer(app);
  }

  const certDir = path.join(__dirname, '..', 'certs');
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return https.createServer(
      {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
      app
    );
  }

  console.warn('[HTTPS] Certificates not found. Run: npm run generate-certs');
  console.warn('[HTTPS] Falling back to HTTP. Generate certs before the lab demo.');
  return http.createServer(app);
}

const httpServer = buildServer();

initializeSocket(httpServer);

app.use(cors());
app.use(express.json());

const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      const auth = authenticateRequest(req);
      return {
        userId: auth?.sub || null,
        auth,
      };
    },
  })
);

app.use('/auth', authRoutes);
app.use('/workouts', workoutRoutes);

app.post('/simulation/start', (req, res) => {
  const started = startSimulation();
  if (started) {
    res.json({ message: 'Simulation started' });
  } else {
    res.status(400).json({ message: 'Simulation is already running' });
  }
});

app.post('/simulation/stop', (req, res) => {
  const stopped = stopSimulation();
  if (stopped) {
    res.json({ message: 'Simulation stopped' });
  } else {
    res.status(400).json({ message: 'Simulation is not running' });
  }
});

app.get('/simulation/status', (req, res) => {
  res.json({ running: isSimulationRunning() });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const protocol =
  httpServer instanceof https.Server ? 'https' : 'http';
const lanIp = process.env.SERVER_IP || 'localhost';

export { app, httpServer };

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT} (${protocol.toUpperCase()})`);
    console.log(`  Local:   ${protocol}://localhost:${PORT}`);
    console.log(`  Network: ${protocol}://${lanIp}:${PORT}`);
  });
}
