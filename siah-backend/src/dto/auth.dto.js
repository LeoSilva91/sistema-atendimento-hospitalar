import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required()
});

export const registerSchema = Joi.object({
  nome: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  tipo: Joi.string().valid('MEDICO', 'ENFERMEIRO', 'ADMINISTRADOR', 'RECEPCIONISTA').required(),
  crm: Joi.string().max(20).optional(),
  especialidade: Joi.string().max(100).optional(),
  consultorio: Joi.string().max(100).optional()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

export const updateUsuarioSchema = Joi.object({
  nome: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  crm: Joi.string().max(20).optional(),
  especialidade: Joi.string().max(100).optional(),
  consultorio: Joi.string().max(100).optional(),
  ativo: Joi.boolean().optional()
});