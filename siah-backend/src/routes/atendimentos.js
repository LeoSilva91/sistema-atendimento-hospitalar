import express from 'express';
import { AtendimentoController } from '../controllers/atendimentoController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { 
  iniciarAtendimentoSchema, 
  finalizarAtendimentoSchema, 
  getAtendimentoEstatisticasSchema 
} from '../dto/atendimento.dto.js';

const router = express.Router();
const atendimentoController = new AtendimentoController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// POST /api/atendimentos/iniciar - Iniciar atendimento
router.post('/iniciar', 
  validate(iniciarAtendimentoSchema), 
  atendimentoController.iniciarAtendimento.bind(atendimentoController)
);

// POST /api/atendimentos/finalizar - Finalizar atendimento
router.post('/finalizar', 
  validate(finalizarAtendimentoSchema), 
  atendimentoController.finalizarAtendimento.bind(atendimentoController)
);

// GET /api/atendimentos/fila - Listar fila de médico
router.get('/fila', 
  atendimentoController.listarFilaMedico.bind(atendimentoController)
);

// GET /api/atendimentos/estatisticas - Obter estatísticas de atendimento
router.get('/estatisticas', 
  validate(getAtendimentoEstatisticasSchema, 'query'), 
  atendimentoController.obterEstatisticasAtendimento.bind(atendimentoController)
);

// GET /api/atendimentos/paciente/:pacienteId - Buscar atendimentos por paciente
router.get('/paciente/:pacienteId', 
  atendimentoController.buscarAtendimentoPorPaciente.bind(atendimentoController)
);

// GET /api/atendimentos/prontuarios/:pacienteId - Buscar prontuários por paciente
router.get('/prontuarios/:pacienteId', 
  atendimentoController.buscarProntuariosPorPaciente.bind(atendimentoController)
);

export default router;