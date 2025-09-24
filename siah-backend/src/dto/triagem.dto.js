import Joi from 'joi';

// DTO para iniciar triagem
export const iniciarTriagemSchema = Joi.object({
  pacienteId: Joi.string().required()
});

// DTO para finalizar triagem
export const finalizarTriagemSchema = Joi.object({
  pacienteId: Joi.string().required(),
  corTriagem: Joi.string().valid('VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL').required(),
  queixaPrincipal: Joi.string().max(1000).required(),
  sinaisVitais: Joi.object({
    pressaoArterial: Joi.string().max(20).optional(),
    temperatura: Joi.alternatives().try(
      Joi.number().min(30).max(45),
      Joi.string().pattern(/^\d+(\.\d+)?$/)
    ).optional(),
    frequenciaCardiaca: Joi.alternatives().try(
      Joi.number().integer().min(30).max(200),
      Joi.string().pattern(/^\d+$/)
    ).optional(),
    frequenciaRespiratoria: Joi.alternatives().try(
      Joi.number().integer().min(5).max(60),
      Joi.string().pattern(/^\d+$/)
    ).optional(),
    saturacaoOxigenio: Joi.alternatives().try(
      Joi.number().min(70).max(100),
      Joi.string().pattern(/^\d+(\.\d+)?$/)
    ).optional(),
    peso: Joi.alternatives().try(
      Joi.number().min(0.5).max(300),
      Joi.string().pattern(/^\d+(\.\d+)?$/)
    ).optional()
  }).optional(),
  nivelDor: Joi.number().integer().min(0).max(10).default(0),
  nivelConsciencia: Joi.string().valid('ALERTA', 'SONOLENTO', 'CONFUSO', 'INCONSCIENTE').default('ALERTA'),
  observacoes: Joi.string().max(2000).optional()
});

// DTO para listar estatísticas de triagem
export const getTriagemEstatisticasSchema = Joi.object({
  dataInicio: Joi.date().optional(),
  dataFim: Joi.date().optional()
});