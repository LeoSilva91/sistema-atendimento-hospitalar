import Joi from 'joi';

// DTO para gerar senha
export const gerarSenhaSchema = Joi.object({
  pacienteId: Joi.string().required().messages({
    'string.empty': 'ID do paciente é obrigatório',
    'any.required': 'ID do paciente é obrigatório'
  }),
  tipo: Joi.string().valid('NORMAL', 'PRIORITARIA', 'URGENTE').optional().messages({
    'any.only': 'Tipo deve ser NORMAL, PRIORITARIA ou URGENTE'
  }),
  prioridade: Joi.string().valid('BAIXA', 'MEDIA', 'ALTA', 'CRITICA').optional().messages({
    'any.only': 'Prioridade deve ser BAIXA, MEDIA, ALTA ou CRITICA'
  })
});

// DTO para atualizar senha
export const atualizarSenhaSchema = Joi.object({
  tipo: Joi.string().valid('NORMAL', 'PRIORITARIA', 'URGENTE').optional().messages({
    'any.only': 'Tipo deve ser NORMAL, PRIORITARIA ou URGENTE'
  }),
  prioridade: Joi.string().valid('BAIXA', 'MEDIA', 'ALTA', 'CRITICA').optional().messages({
    'any.only': 'Prioridade deve ser BAIXA, MEDIA, ALTA ou CRITICA'
  })
});

// DTO para atualizar status da senha
export const atualizarStatusSenhaSchema = Joi.object({
  status: Joi.string().valid('AGUARDANDO', 'CHAMADA', 'ATENDIDA', 'CANCELADA').required().messages({
    'any.only': 'Status deve ser AGUARDANDO, CHAMADA, ATENDIDA ou CANCELADA',
    'any.required': 'Status é obrigatório'
  })
});

// DTO para cancelar senha
export const cancelarSenhaSchema = Joi.object({
  motivo: Joi.string().max(500).optional().messages({
    'string.max': 'Motivo não pode exceder 500 caracteres'
  })
});
