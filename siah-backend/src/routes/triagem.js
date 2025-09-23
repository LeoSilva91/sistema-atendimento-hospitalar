import express from 'express';
import { TriagemController } from '../controllers/triagemController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { 
  iniciarTriagemSchema, 
  finalizarTriagemSchema, 
  getTriagemEstatisticasSchema 
} from '../dto/triagem.dto.js';

const router = express.Router();
const triagemController = new TriagemController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// POST /api/triagem/iniciar - Iniciar triagem
router.post('/iniciar', 
  validate(iniciarTriagemSchema), 
  triagemController.iniciarTriagem.bind(triagemController)
);

// POST /api/triagem/finalizar - Finalizar triagem
router.post('/finalizar', 
  validate(finalizarTriagemSchema), 
  triagemController.finalizarTriagem.bind(triagemController)
);

// GET /api/triagem/fila - Listar fila de triagem
router.get('/fila', 
  triagemController.listarFilaTriagem.bind(triagemController)
);

// GET /api/triagem/estatisticas - Obter estatísticas de triagem
router.get('/estatisticas', 
  validate(getTriagemEstatisticasSchema, 'query'), 
  triagemController.obterEstatisticasTriagem.bind(triagemController)
);

// GET /api/triagem/paciente/:pacienteId - Buscar triagem por paciente
router.get('/paciente/:pacienteId', 
  triagemController.buscarTriagemPorPaciente.bind(triagemController)
);

export default router;