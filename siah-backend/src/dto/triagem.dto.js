import Joi from 'joi';

// DTO para criar triagem
export const criarTriagemSchema = Joi.object({
  pacienteId: Joi.string().required().messages({
    'string.empty': 'ID do paciente é obrigatório',
    'any.required': 'ID do paciente é obrigatório'
  }),
  pressaoArterial: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/).optional().messages({
    'string.pattern.base': 'Pressão arterial deve estar no formato XXX/XX'
  }),
  temperatura: Joi.number().min(30).max(45).optional().messages({
    'number.min': 'Temperatura deve ser maior que 30°C',
    'number.max': 'Temperatura deve ser menor que 45°C'
  }),
  frequenciaCardiaca: Joi.number().integer().min(30).max(300).optional().messages({
    'number.integer': 'Frequência cardíaca deve ser um número inteiro',
    'number.min': 'Frequência cardíaca deve ser maior que 30 bpm',
    'number.max': 'Frequência cardíaca deve ser menor que 300 bpm'
  }),
  frequenciaRespiratoria: Joi.number().integer().min(5).max(60).optional().messages({
    'number.integer': 'Frequência respiratória deve ser um número inteiro',
    'number.min': 'Frequência respiratória deve ser maior que 5 rpm',
    'number.max': 'Frequência respiratória deve ser menor que 60 rpm'
  }),
  saturacaoOxigenio: Joi.number().min(70).max(100).optional().messages({
    'number.min': 'Saturação de oxigênio deve ser maior que 70%',
    'number.max': 'Saturação de oxigênio deve ser menor que 100%'
  }),
  nivelRisco: Joi.string().valid('VERDE', 'AMARELO', 'LARANJA', 'VERMELHO').optional().messages({
    'any.only': 'Nível de risco deve ser VERDE, AMARELO, LARANJA ou VERMELHO'
  }),
  observacoes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  })
});

// DTO para atualizar triagem
export const atualizarTriagemSchema = Joi.object({
  pressaoArterial: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/).optional().messages({
    'string.pattern.base': 'Pressão arterial deve estar no formato XXX/XX'
  }),
  temperatura: Joi.number().min(30).max(45).optional().messages({
    'number.min': 'Temperatura deve ser maior que 30°C',
    'number.max': 'Temperatura deve ser menor que 45°C'
  }),
  frequenciaCardiaca: Joi.number().integer().min(30).max(300).optional().messages({
    'number.integer': 'Frequência cardíaca deve ser um número inteiro',
    'number.min': 'Frequência cardíaca deve ser maior que 30 bpm',
    'number.max': 'Frequência cardíaca deve ser menor que 300 bpm'
  }),
  frequenciaRespiratoria: Joi.number().integer().min(5).max(60).optional().messages({
    'number.integer': 'Frequência respiratória deve ser um número inteiro',
    'number.min': 'Frequência respiratória deve ser maior que 5 rpm',
    'number.max': 'Frequência respiratória deve ser menor que 60 rpm'
  }),
  saturacaoOxigenio: Joi.number().min(70).max(100).optional().messages({
    'number.min': 'Saturação de oxigênio deve ser maior que 70%',
    'number.max': 'Saturação de oxigênio deve ser menor que 100%'
  }),
  nivelRisco: Joi.string().valid('VERDE', 'AMARELO', 'LARANJA', 'VERMELHO').optional().messages({
    'any.only': 'Nível de risco deve ser VERDE, AMARELO, LARANJA ou VERMELHO'
  }),
  observacoes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  })
});

// DTO para classificar risco
export const classificarRiscoSchema = Joi.object({
  nivelRisco: Joi.string().valid('VERDE', 'AMARELO', 'LARANJA', 'VERMELHO').required().messages({
    'any.only': 'Nível de risco deve ser VERDE, AMARELO, LARANJA ou VERMELHO',
    'any.required': 'Nível de risco é obrigatório'
  }),
  observacoes: Joi.string().max(1000).optional().messages({
    'string.max': 'Observações não podem exceder 1000 caracteres'
  })
});
