import express from 'express';
import { TriagemController } from '../controllers/triagemController.js';
import { authenticateToken, authorize } from '../middlewares/auth.js';
import { validateTriagem } from '../middlewares/validation.js';

const router = express.Router();
const triagemController = new TriagemController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ========================================
// ROTAS DE TRIAGEM
// ========================================

// GET /api/triagem - Listar triagens
router.get('/', 
  authorize('ENFERMEIRO', 'ADMINISTRADOR', 'MEDICO'),
  triagemController.listarTriagens
);

// GET /api/triagem/:id - Buscar triagem por ID
router.get('/:id',
  authorize('ENFERMEIRO', 'ADMINISTRADOR', 'MEDICO'),
  triagemController.buscarTriagem
);

// POST /api/triagem - Criar nova triagem
router.post('/',
  authorize('ENFERMEIRO', 'ADMINISTRADOR'),
  validateTriagem,
  triagemController.criarTriagem
);

// PUT /api/triagem/:id - Atualizar triagem
router.put('/:id',
  authorize('ENFERMEIRO', 'ADMINISTRADOR'),
  validateTriagem,
  triagemController.atualizarTriagem
);

// GET /api/triagem/paciente/:pacienteId - Triagens de um paciente
router.get('/paciente/:pacienteId',
  authorize('ENFERMEIRO', 'ADMINISTRADOR', 'MEDICO'),
  triagemController.triagensPorPaciente
);

// GET /api/triagem/hoje - Triagens do dia
router.get('/hoje/lista',
  authorize('ENFERMEIRO', 'ADMINISTRADOR', 'MEDICO'),
  triagemController.triagensHoje
);

// GET /api/triagem/fila - Fila de triagem
router.get('/fila/aguardando',
  authorize('ENFERMEIRO', 'ADMINISTRADOR'),
  triagemController.filaTriagem
);

// POST /api/triagem/:id/classificar - Classificar risco
router.post('/:id/classificar',
  authorize('ENFERMEIRO', 'ADMINISTRADOR'),
  triagemController.classificarRisco
);

// GET /api/triagem/estatisticas - Estatísticas de triagem
router.get('/estatisticas/geral',
  authorize('ENFERMEIRO', 'ADMINISTRADOR', 'MEDICO'),
  triagemController.estatisticasTriagem
);

// GET /api/triagem/risco/:nivelRisco - Triagens por nível de risco
router.get('/risco/:nivelRisco',
  authorize('ENFERMEIRO', 'ADMINISTRADOR', 'MEDICO'),
  triagemController.triagensPorRisco
);

export default router;
