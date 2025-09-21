import express from 'express';
import { SenhaController } from '../controllers/senhaController.js';
import { authenticateToken, authorize } from '../middlewares/auth.js';
import { validateSenha } from '../middlewares/validation.js';

const router = express.Router();
const senhaController = new SenhaController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ========================================
// ROTAS DE SENHAS
// ========================================

// GET /api/senhas - Listar senhas
router.get('/', 
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO', 'MEDICO'),
  senhaController.listarSenhas
);

// GET /api/senhas/:id - Buscar senha por ID
router.get('/:id',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO', 'MEDICO'),
  senhaController.buscarSenha
);

// POST /api/senhas - Gerar nova senha
router.post('/',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR'),
  validateSenha,
  senhaController.gerarSenha
);

// PUT /api/senhas/:id - Atualizar senha
router.put('/:id',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR'),
  validateSenha,
  senhaController.atualizarSenha
);

// PATCH /api/senhas/:id/status - Atualizar status da senha
router.patch('/:id/status',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO'),
  senhaController.atualizarStatus
);

// DELETE /api/senhas/:id - Cancelar senha
router.delete('/:id',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR'),
  senhaController.cancelarSenha
);

// GET /api/senhas/fila/aguardando - Fila de senhas aguardando
router.get('/fila/aguardando',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO'),
  senhaController.filaAguardando
);

// GET /api/senhas/hoje - Senhas do dia
router.get('/hoje/lista',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO', 'MEDICO'),
  senhaController.senhasHoje
);

// POST /api/senhas/:id/chamar - Chamar senha
router.post('/:id/chamar',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR'),
  senhaController.chamarSenha
);

// POST /api/senhas/:id/atender - Marcar como atendida
router.post('/:id/atender',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO', 'MEDICO'),
  senhaController.atenderSenha
);

// GET /api/senhas/estatisticas - Estatísticas de senhas
router.get('/estatisticas/geral',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO', 'MEDICO'),
  senhaController.estatisticasSenhas
);

// GET /api/senhas/tipo/:tipo - Senhas por tipo
router.get('/tipo/:tipo',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO', 'MEDICO'),
  senhaController.senhasPorTipo
);

// GET /api/senhas/paciente/:pacienteId - Senhas de um paciente
router.get('/paciente/:pacienteId',
  authorize('RECEPCIONISTA', 'ADMINISTRADOR', 'ENFERMEIRO', 'MEDICO'),
  senhaController.senhasPorPaciente
);

export default router;
