import express from 'express';
import { SenhaController } from '../controllers/senhaController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { 
  createSenhaSchema, 
  updateSenhaStatusSchema, 
  chamarSenhaSchema, 
  getSenhasSchema 
} from '../dto/senhas.dto.js';

const router = express.Router();
const senhaController = new SenhaController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// POST /api/senhas - Gerar nova senha
router.post('/', 
  validate(createSenhaSchema), 
  senhaController.gerarSenha.bind(senhaController)
);

// GET /api/senhas/aguardando - Listar senhas aguardando
router.get('/aguardando', 
  senhaController.listarSenhasAguardando.bind(senhaController)
);

// POST /api/senhas/chamar - Chamar senha
router.post('/chamar', 
  validate(chamarSenhaSchema), 
  senhaController.chamarSenha.bind(senhaController)
);

// POST /api/senhas/cadastrada - Marcar senha como cadastrada
router.post('/cadastrada', 
  senhaController.marcarSenhaCadastrada.bind(senhaController)
);

// GET /api/senhas - Listar senhas com filtros
router.get('/', 
  validate(getSenhasSchema, 'query'), 
  senhaController.listarSenhas.bind(senhaController)
);

// GET /api/senhas/:id - Buscar senha por ID
router.get('/:id', 
  senhaController.buscarSenhaPorId.bind(senhaController)
);

// GET /api/senhas/estatisticas - Obter estatísticas de senhas
router.get('/estatisticas', 
  senhaController.obterEstatisticasSenhas.bind(senhaController)
);

export default router;