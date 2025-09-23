import express from 'express';
import { PacienteController } from '../controllers/pacienteController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { 
  createPacienteSchema, 
  updatePacienteSchema, 
  getPacientesSchema 
} from '../dto/pacientes.dto.js';

const router = express.Router();
const pacienteController = new PacienteController();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/pacientes - Listar pacientes
router.get('/', 
  validate(getPacientesSchema, 'query'),
  (req, res, next) => pacienteController.getPacientes(req, res, next)
);

// GET /api/pacientes/:id - Buscar paciente por ID
router.get('/:id', 
  (req, res, next) => pacienteController.getPacienteById(req, res, next)
);

// POST /api/pacientes - Criar paciente
router.post('/', 
  validate(createPacienteSchema),
  (req, res, next) => pacienteController.createPaciente(req, res, next)
);

// PUT /api/pacientes/:id - Atualizar paciente
router.put('/:id', 
  validate(updatePacienteSchema),
  (req, res, next) => pacienteController.updatePaciente(req, res, next)
);

// DELETE /api/pacientes/:id - Deletar paciente
router.delete('/:id', 
  (req, res, next) => pacienteController.deletePaciente(req, res, next)
);

export default router;