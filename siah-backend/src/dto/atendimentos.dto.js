import Joi from 'joi';

// DTO para criar atendimento
export const criarAtendimentoSchema = Joi.object({
  pacienteId: Joi.string().required().messages({
    'string.empty': 'ID do paciente é obrigatório',
    'any.required': 'ID do paciente é obrigatório'
  }),
  dataHora: Joi.date().required().messages({
    'date.base': 'Data e hora devem ser válidas',
    'any.required': 'Data e hora são obrigatórias'
  }),
  observacoes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  })
});

// DTO para atualizar atendimento
export const atualizarAtendimentoSchema = Joi.object({
  dataHora: Joi.date().optional().messages({
    'date.base': 'Data e hora devem ser válidas'
  }),
  observacoes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  })
});

// DTO para atualizar status do atendimento
export const atualizarStatusAtendimentoSchema = Joi.object({
  status: Joi.string().valid('AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO').required().messages({
    'any.only': 'Status deve ser AGENDADO, EM_ANDAMENTO, CONCLUIDO ou CANCELADO',
    'any.required': 'Status é obrigatório'
  })
});

// DTO para finalizar atendimento
export const finalizarAtendimentoSchema = Joi.object({
  observacoes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  }),
  diagnostico: Joi.string().max(500).optional().messages({
    'string.max': 'Diagnóstico não pode exceder 500 caracteres'
  }),
  prescricao: Joi.string().max(1000).optional().messages({
    'string.max': 'Prescrição não pode exceder 1000 caracteres'
  })
});

// DTO para cancelar atendimento
export const cancelarAtendimentoSchema = Joi.object({
  motivo: Joi.string().max(500).optional().messages({
    'string.max': 'Motivo não pode exceder 500 caracteres'
  })
});
