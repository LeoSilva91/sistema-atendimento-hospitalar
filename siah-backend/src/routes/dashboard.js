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
  dashboardController.overview
);

// GET /api/dashboard/estatisticas - Estatísticas gerais
router.get('/estatisticas',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.estatisticas
);

// GET /api/dashboard/filas - Status das filas
router.get('/filas',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO', 'RECEPCIONISTA'),
  dashboardController.statusFilas
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

export default router;
