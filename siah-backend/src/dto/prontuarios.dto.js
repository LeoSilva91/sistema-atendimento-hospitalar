import Joi from 'joi';

// DTO para criar prontuário
export const criarProntuarioSchema = Joi.object({
  pacienteId: Joi.string().required().messages({
    'string.empty': 'ID do paciente é obrigatório',
    'any.required': 'ID do paciente é obrigatório'
  }),
  atendimentoId: Joi.string().required().messages({
    'string.empty': 'ID do atendimento é obrigatório',
    'any.required': 'ID do atendimento é obrigatório'
  }),
  evolucao: Joi.string().min(10).max(5000).required().messages({
    'string.min': 'Evolução deve ter pelo menos 10 caracteres',
    'string.max': 'Evolução não pode exceder 5000 caracteres',
    'any.required': 'Evolução é obrigatória'
  }),
  diagnostico: Joi.string().max(1000).optional().messages({
    'string.max': 'Diagnóstico não pode exceder 1000 caracteres'
  }),
  prescricao: Joi.string().max(2000).optional().messages({
    'string.max': 'Prescrição não pode exceder 2000 caracteres'
  }),
  exames: Joi.string().max(1000).optional().messages({
    'string.max': 'Exames não podem exceder 1000 caracteres'
  }),
  observacoes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  })
});

// DTO para atualizar prontuário
export const atualizarProntuarioSchema = Joi.object({
  evolucao: Joi.string().min(10).max(5000).optional().messages({
    'string.min': 'Evolução deve ter pelo menos 10 caracteres',
    'string.max': 'Evolução não pode exceder 5000 caracteres'
  }),
  diagnostico: Joi.string().max(1000).optional().messages({
    'string.max': 'Diagnóstico não pode exceder 1000 caracteres'
  }),
  prescricao: Joi.string().max(2000).optional().messages({
    'string.max': 'Prescrição não pode exceder 2000 caracteres'
  }),
  exames: Joi.string().max(1000).optional().messages({
    'string.max': 'Exames não podem exceder 1000 caracteres'
  }),
  observacoes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  })
});

// DTO para adicionar evolução
export const adicionarEvolucaoSchema = Joi.object({
  evolucao: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Evolução deve ter pelo menos 10 caracteres',
    'string.max': 'Evolução não pode exceder 2000 caracteres',
    'any.required': 'Evolução é obrigatória'
  })
});
