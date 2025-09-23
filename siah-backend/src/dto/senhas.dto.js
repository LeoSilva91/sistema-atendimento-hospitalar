import Joi from 'joi';

// DTO para gerar nova senha
export const createSenhaSchema = Joi.object({
  tipo: Joi.string().valid('NORMAL', 'PRIORIDADE').required()
});

// DTO para atualizar status da senha
export const updateSenhaStatusSchema = Joi.object({
  status: Joi.string().valid('AGUARDANDO', 'CHAMADA', 'CADASTRADO', 'ATENDIDA', 'CANCELADA').required()
});

// DTO para chamar senha
export const chamarSenhaSchema = Joi.object({
  senhaId: Joi.string().required()
});

// DTO para listar senhas
export const getSenhasSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('AGUARDANDO', 'CHAMADA', 'CADASTRADO', 'ATENDIDA', 'CANCELADA'),
  tipo: Joi.string().valid('NORMAL', 'PRIORIDADE'),
  search: Joi.string().max(255)
});