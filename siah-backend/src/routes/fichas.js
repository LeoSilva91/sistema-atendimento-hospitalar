import express from 'express';
import { FichaController } from '../controllers/fichaController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { 
  emitirFichaSchema, 
  getFichasSchema, 
  getFichaByIdSchema 
} from '../dto/fichas.dto.js';

const router = express.Router();
const fichaController = new FichaController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// POST /api/fichas/emitir - Emitir ficha
router.post('/emitir', 
  validate(emitirFichaSchema), 
  fichaController.emitirFicha.bind(fichaController)
);

// GET /api/fichas - Listar fichas com filtros
router.get('/', 
  validate(getFichasSchema, 'query'), 
  fichaController.listarFichas.bind(fichaController)
);

// GET /api/fichas/:id - Buscar ficha por ID
router.get('/:id', 
  validate(getFichaByIdSchema, 'params'), 
  fichaController.buscarFichaPorId.bind(fichaController)
);

// PUT /api/fichas/:id/status - Atualizar status da ficha
router.put('/:id/status', 
  fichaController.atualizarStatusFicha.bind(fichaController)
);

// GET /api/fichas/estatisticas - Obter estatísticas de fichas
router.get('/estatisticas', 
  fichaController.obterEstatisticasFichas.bind(fichaController)
);

export default router;
