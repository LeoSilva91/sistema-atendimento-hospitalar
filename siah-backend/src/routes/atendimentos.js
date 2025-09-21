import express from 'express';
import { AtendimentoController } from '../controllers/atendimentoController.js';
import { authenticateToken, authorize } from '../middlewares/auth.js';
import { validateAtendimento } from '../middlewares/validation.js';

const router = express.Router();
const atendimentoController = new AtendimentoController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ========================================
// ROTAS DE ATENDIMENTOS
// ========================================

// GET /api/atendimentos - Listar atendimentos
router.get('/', 
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  atendimentoController.listarAtendimentos
);

// GET /api/atendimentos/:id - Buscar atendimento por ID
router.get('/:id',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  atendimentoController.buscarAtendimento
);

// POST /api/atendimentos - Criar novo atendimento
router.post('/',
  authorize('MEDICO', 'ADMINISTRADOR'),
  validateAtendimento,
  atendimentoController.criarAtendimento
);

// PUT /api/atendimentos/:id - Atualizar atendimento
router.put('/:id',
  authorize('MEDICO', 'ADMINISTRADOR'),
  validateAtendimento,
  atendimentoController.atualizarAtendimento
);

// PATCH /api/atendimentos/:id/status - Atualizar status do atendimento
router.patch('/:id/status',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  atendimentoController.atualizarStatus
);

// DELETE /api/atendimentos/:id - Cancelar atendimento
router.delete('/:id',
  authorize('MEDICO', 'ADMINISTRADOR'),
  atendimentoController.cancelarAtendimento
);

// GET /api/atendimentos/paciente/:pacienteId - Atendimentos de um paciente
router.get('/paciente/:pacienteId',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  atendimentoController.atendimentosPorPaciente
);

// GET /api/atendimentos/medico/:medicoId - Atendimentos de um médico
router.get('/medico/:medicoId',
  authorize('MEDICO', 'ADMINISTRADOR'),
  atendimentoController.atendimentosPorMedico
);

// GET /api/atendimentos/hoje - Atendimentos do dia
router.get('/hoje/agenda',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  atendimentoController.atendimentosHoje
);

// POST /api/atendimentos/:id/iniciar - Iniciar atendimento
router.post('/:id/iniciar',
  authorize('MEDICO', 'ADMINISTRADOR'),
  atendimentoController.iniciarAtendimento
);

// POST /api/atendimentos/:id/finalizar - Finalizar atendimento
router.post('/:id/finalizar',
  authorize('MEDICO', 'ADMINISTRADOR'),
  atendimentoController.finalizarAtendimento
);

export default router;
