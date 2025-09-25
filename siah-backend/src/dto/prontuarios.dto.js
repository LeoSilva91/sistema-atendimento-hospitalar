import Joi from 'joi';

// Schema para medicamentos
const medicamentoSchema = Joi.object({
  id: Joi.any().optional().strip(), // Campo do frontend, será removido
  nome: Joi.string().required().messages({
    'string.empty': 'Nome do medicamento é obrigatório',
    'any.required': 'Nome do medicamento é obrigatório'
  }),
  dosagem: Joi.string().required().messages({
    'string.empty': 'Dosagem é obrigatória',
    'any.required': 'Dosagem é obrigatória'
  }),
  posologia: Joi.string().required().messages({
    'string.empty': 'Posologia é obrigatória',
    'any.required': 'Posologia é obrigatória'
  }),
  duracao: Joi.string().optional().allow(''),
  observacoes: Joi.string().optional().allow('')
});

// Schema para exames
const exameSchema = Joi.object({
  id: Joi.any().optional().strip(), // Campo do frontend, será removido
  nome: Joi.string().required().messages({
    'string.empty': 'Nome do exame é obrigatório',
    'any.required': 'Nome do exame é obrigatório'
  }),
  urgencia: Joi.string().valid('normal', 'urgente', 'emergencial').default('normal'),
  justificativa: Joi.string().required().messages({
    'string.empty': 'Justificativa é obrigatória',
    'any.required': 'Justificativa é obrigatória'
  })
});

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
  diagnostico: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Diagnóstico não pode exceder 1000 caracteres'
  }),
  condutas: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Condutas não podem exceder 1000 caracteres'
  }),
  // Suporte para ambos os formatos: string (legado) e array (novo)
  prescricao: Joi.string().max(2000).optional().allow('').messages({
    'string.max': 'Prescrição não pode exceder 2000 caracteres'
  }),
  prescricoes: Joi.array().items(medicamentoSchema).optional().messages({
    'array.base': 'Prescrições devem ser um array de medicamentos'
  }),
  // Suporte para ambos os formatos: string (legado) e array (novo)
  exames: Joi.alternatives().try(
    Joi.string().max(1000).allow(''),
    Joi.array().items(exameSchema)
  ).optional().messages({
    'alternatives.match': 'Exames devem ser uma string ou array de exames'
  }),
  orientacoes: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Orientações não podem exceder 1000 caracteres'
  }),
  encaminhamento: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Encaminhamento não pode exceder 1000 caracteres'
  }),
  dataRetorno: Joi.date().iso().optional().allow(null).messages({
    'date.format': 'Data de retorno deve estar no formato ISO (YYYY-MM-DD)'
  }),
  statusFinal: Joi.string().valid(
    'ATENDIMENTO_CONCLUIDO',
    'AGUARDANDO_EXAME', 
    'INTERNADO',
    'ENCAMINHADO'
  ).optional().default('ATENDIMENTO_CONCLUIDO'),
  observacoes: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  })
}).custom((value, helpers) => {
  // Garantir que pelo menos prescricao ou prescricoes seja fornecido se medicamentos forem necessários
  if (!value.prescricao && !value.prescricoes) {
    return value; // Ambos são opcionais
  }
  return value;
});

// DTO para atualizar prontuário
export const atualizarProntuarioSchema = Joi.object({
  evolucao: Joi.string().min(10).max(5000).optional().messages({
    'string.min': 'Evolução deve ter pelo menos 10 caracteres',
    'string.max': 'Evolução não pode exceder 5000 caracteres'
  }),
  diagnostico: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Diagnóstico não pode exceder 1000 caracteres'
  }),
  condutas: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Condutas não podem exceder 1000 caracteres'
  }),
  // Suporte para ambos os formatos: string (legado) e array (novo)
  prescricao: Joi.string().max(2000).optional().allow('').messages({
    'string.max': 'Prescrição não pode exceder 2000 caracteres'
  }),
  prescricoes: Joi.array().items(medicamentoSchema).optional().messages({
    'array.base': 'Prescrições devem ser um array de medicamentos'
  }),
  // Suporte para ambos os formatos: string (legado) e array (novo)
  exames: Joi.alternatives().try(
    Joi.string().max(1000).allow(''),
    Joi.array().items(exameSchema)
  ).optional().messages({
    'alternatives.match': 'Exames devem ser uma string ou array de exames'
  }),
  orientacoes: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Orientações não podem exceder 1000 caracteres'
  }),
  encaminhamento: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Encaminhamento não pode exceder 1000 caracteres'
  }),
  dataRetorno: Joi.date().iso().optional().allow(null).messages({
    'date.format': 'Data de retorno deve estar no formato ISO (YYYY-MM-DD)'
  }),
  statusFinal: Joi.string().valid(
    'ATENDIMENTO_CONCLUIDO',
    'AGUARDANDO_EXAME', 
    'INTERNADO',
    'ENCAMINHADO'
  ).optional(),
  observacoes: Joi.string().max(1000).optional().allow('').messages({
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
