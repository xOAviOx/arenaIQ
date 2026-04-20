import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { createSocketServer } from './socket';
import healthRouter from './routes/health';
import adminRouter from './routes/admin';

const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/admin', adminRouter);

const httpServer = http.createServer(app);
createSocketServer(httpServer);

httpServer.listen(config.port, () => {
  console.log(`ArenaIQ server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0));
});
