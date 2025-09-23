import express from 'express';
import { ProntuarioController } from '../controllers/prontuarioController.js';
import { authenticateToken, authorize } from '../middlewares/auth.js';

const router = express.Router();
const prontuarioController = new ProntuarioController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ========================================
// ROTAS DE PRONTUÁRIOS
// ========================================

// GET /api/prontuarios - Listar prontuários
router.get('/', 
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  prontuarioController.listarProntuarios
);

// GET /api/prontuarios/:id - Buscar prontuário por ID
router.get('/:id',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  prontuarioController.buscarProntuario
);

// POST /api/prontuarios - Criar novo prontuário
router.post('/',
  authorize('MEDICO', 'ADMINISTRADOR'),
  prontuarioController.criarProntuario
);

// PUT /api/prontuarios/:id - Atualizar prontuário
router.put('/:id',
  authorize('MEDICO', 'ADMINISTRADOR'),
  prontuarioController.atualizarProntuario
);

// DELETE /api/prontuarios/:id - Excluir prontuário
router.delete('/:id',
  authorize('MEDICO', 'ADMINISTRADOR'),
  prontuarioController.excluirProntuario
);

// GET /api/prontuarios/paciente/:pacienteId - Prontuários de um paciente
router.get('/paciente/:pacienteId',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  prontuarioController.prontuariosPorPaciente
);

// GET /api/prontuarios/atendimento/:atendimentoId - Prontuários de um atendimento
router.get('/atendimento/:atendimentoId',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  prontuarioController.prontuariosPorAtendimento
);

// GET /api/prontuarios/medico/:medicoId - Prontuários de um médico
router.get('/medico/:medicoId',
  authorize('MEDICO', 'ADMINISTRADOR'),
  prontuarioController.prontuariosPorMedico
);

// GET /api/prontuarios/hoje - Prontuários do dia
router.get('/hoje/lista',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  prontuarioController.prontuariosHoje
);

// POST /api/prontuarios/:id/evolucao - Adicionar evolução
router.post('/:id/evolucao',
  authorize('MEDICO', 'ADMINISTRADOR'),
  prontuarioController.adicionarEvolucao
);

// GET /api/prontuarios/estatisticas - Estatísticas de prontuários
router.get('/estatisticas/geral',
  authorize('MEDICO', 'ADMINISTRADOR', 'ENFERMEIRO'),
  prontuarioController.estatisticasProntuarios
);

export default router;
