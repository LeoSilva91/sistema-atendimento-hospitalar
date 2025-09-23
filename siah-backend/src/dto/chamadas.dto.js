import Joi from 'joi';

// DTO para criar chamada
export const createChamadaSchema = Joi.object({
  pacienteId: Joi.string().required(),
  tipo: Joi.string().valid('TRIAGEM', 'CONSULTA').required(),
  local: Joi.string().max(255).required()
});

// DTO para finalizar chamada
export const finalizarChamadaSchema = Joi.object({
  chamadaId: Joi.string().required()
});

// DTO para listar chamadas ativas
export const getChamadasAtivasSchema = Joi.object({
  tipo: Joi.string().valid('TRIAGEM', 'CONSULTA').optional(),
  limit: Joi.number().integer().min(1).max(50).default(10)
});
