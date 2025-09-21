import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { database } from './src/utils/database.js';
import { logger } from './src/utils/logger.js';
import { errorHandler } from './src/middlewares/erroHandler.js';

// Importar rotas
import authRoutes from './src/routes/auth.js';
import pacienteRoutes from './src/routes/pacientes.js';
import atendimentoRoutes from './src/routes/atendimentos.js';
import triagemRoutes from './src/routes/triagem.js';
import senhaRoutes from './src/routes/senhas.js';
import prontuarioRoutes from './src/routes/prontuarios.js';
import dashboardRoutes from './src/routes/dashboard.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    success: false,
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// ROTAS
// ========================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SIAH Backend está funcionando',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/atendimentos', atendimentoRoutes);
app.use('/api/triagem', triagemRoutes);
app.use('/api/senhas', senhaRoutes);
app.use('/api/prontuarios', prontuarioRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

async function startServer() {
  try {
    // Conectar ao banco de dados
    await database.connect();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor SIAH rodando na porta ${PORT}`);
      logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM recebido. Encerrando servidor...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT recebido. Encerrando servidor...');
  await database.disconnect();
  process.exit(0);
});

// Iniciar servidor
startServer();

export default app;
