import Joi from 'joi';

// DTO para estatísticas gerais
export const getEstatisticasSchema = Joi.object({
  dataInicio: Joi.date().optional(),
  dataFim: Joi.date().optional()
});

// DTO para dados do painel público
export const getPainelPublicoSchema = Joi.object({
  incluirChamadas: Joi.boolean().default(true),
  incluirSenhas: Joi.boolean().default(true)
});

// DTO para relatórios
export const getRelatorioSchema = Joi.object({
  dataInicio: Joi.date().required(),
  dataFim: Joi.date().required(),
  formato: Joi.string().valid('pdf', 'excel', 'json').default('json'),
  tipo: Joi.string().valid('atendimentos', 'triagem', 'pacientes').required()
});
