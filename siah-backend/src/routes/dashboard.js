import express from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticateToken, authorize } from '../middlewares/auth.js';

const router = express.Router();
const dashboardController = new DashboardController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ========================================
// ROTAS DE DASHBOARD
// ========================================

// GET /api/dashboard/overview - Visão geral do sistema
router.get('/overview',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.overview.bind(dashboardController).bind(dashboardController)
);

// GET /api/dashboard/estatisticas - Estatísticas gerais
router.get('/estatisticas',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.estatisticas.bind(dashboardController)
);

// GET /api/dashboard/filas - Status das filas
router.get('/filas',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.statusFilas.bind(dashboardController)
);

// GET /api/dashboard/atendimentos-hoje - Atendimentos do dia
router.get('/atendimentos-hoje',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  dashboardController.atendimentosHoje
);

// GET /api/dashboard/triagens-hoje - Triagens do dia
router.get('/triagens-hoje',
  authorize('ENFERMEIRO', 'ADMINISTRADOR', 'MEDICO'),
  dashboardController.triagensHoje
);

// GET /api/dashboard/senhas-hoje - Senhas do dia
router.get('/senhas-hoje',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO', 'MEDICO'),
  dashboardController.senhasHoje
);

// GET /api/dashboard/medicos-ativos - Médicos ativos
router.get('/medicos-ativos',
  authorize('MEDICO', 'ADMINISTRADOR'),
  dashboardController.medicosAtivos
);

// GET /api/dashboard/pacientes-recentes - Pacientes recentes
router.get('/pacientes-recentes',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.pacientesRecentes
);

// GET /api/dashboard/alertas - Alertas do sistema
router.get('/alertas',
  authorize('ADMINISTRADOR'),
  dashboardController.alertas
);

// GET /api/dashboard/relatorios - Relatórios disponíveis
router.get('/relatorios',
  authorize('MEDICO', 'ADMINISTRADOR'),
  dashboardController.relatorios
);

// GET /api/dashboard/dados-filas - Dados das filas
router.get('/dados-filas',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.getDadosFilas
);

// GET /api/dashboard/painel-publico - Dados do painel público
router.get('/painel-publico',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.getPainelPublico
);

// POST /api/dashboard/gerar-relatorio - Gerar relatório
router.post('/gerar-relatorio',
  authorize('MEDICO', 'ADMINISTRADOR'),
  dashboardController.gerarRelatorio
);

// GET /api/dashboard/metricas-tempo-real - Métricas em tempo real
router.get('/metricas-tempo-real',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.getMetricasTempoReal
);

export default router;
