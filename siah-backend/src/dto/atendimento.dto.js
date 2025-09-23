import Joi from 'joi';

// DTO para iniciar atendimento
export const iniciarAtendimentoSchema = Joi.object({
  pacienteId: Joi.string().required()
});

// DTO para finalizar atendimento
export const finalizarAtendimentoSchema = Joi.object({
  pacienteId: Joi.string().required(),
  diagnostico: Joi.string().max(1000).optional(),
  condutas: Joi.string().max(2000).optional(),
  prescricoes: Joi.array().items(
    Joi.object({
      nome: Joi.string().max(255).required(),
      dosagem: Joi.string().max(100).required(),
      posologia: Joi.string().max(255).required(),
      duracao: Joi.string().max(100).required(),
      observacoes: Joi.string().max(500).optional()
    })
  ).optional(),
  exames: Joi.array().items(
    Joi.object({
      nome: Joi.string().max(255).required(),
      urgencia: Joi.string().valid('normal', 'urgente', 'emergencial').default('normal'),
      justificativa: Joi.string().max(500).required()
    })
  ).optional(),
  orientacoes: Joi.string().max(2000).optional(),
  encaminhamento: Joi.string().max(500).optional(),
  dataRetorno: Joi.date().optional(),
  statusFinal: Joi.string().valid(
    'ATENDIMENTO_CONCLUIDO', 
    'AGUARDANDO_EXAME', 
    'INTERNADO', 
    'ENCAMINHADO'
  ).required()
});

// DTO para listar estatísticas de atendimento
export const getAtendimentoEstatisticasSchema = Joi.object({
  dataInicio: Joi.date().optional(),
  dataFim: Joi.date().optional()
});
