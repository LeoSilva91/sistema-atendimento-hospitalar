import express from 'express';
import { ChamadaController } from '../controllers/chamadaController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { 
  createChamadaSchema, 
  finalizarChamadaSchema, 
  getChamadasAtivasSchema 
} from '../dto/chamadas.dto.js';

const router = express.Router();
const chamadaController = new ChamadaController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// POST /api/chamadas - Criar chamada
router.post('/', 
  validate(createChamadaSchema), 
  chamadaController.criarChamada.bind(chamadaController)
);

// GET /api/chamadas/ativas - Listar chamadas ativas
router.get('/ativas', 
  validate(getChamadasAtivasSchema, 'query'), 
  chamadaController.listarChamadasAtivas.bind(chamadaController)
);

// POST /api/chamadas/finalizar - Finalizar chamada
router.post('/finalizar', 
  validate(finalizarChamadaSchema), 
  chamadaController.finalizarChamada.bind(chamadaController)
);

// POST /api/chamadas/finalizar-antigas - Finalizar chamadas antigas
router.post('/finalizar-antigas', 
  chamadaController.finalizarChamadasAntigas.bind(chamadaController)
);

// GET /api/chamadas/estatisticas - Obter estatísticas de chamadas
router.get('/estatisticas', 
  chamadaController.obterEstatisticasChamadas.bind(chamadaController)
);

// GET /api/chamadas/:id - Buscar chamada por ID
router.get('/:id', 
  chamadaController.buscarChamadaPorId.bind(chamadaController)
);

export default router;
