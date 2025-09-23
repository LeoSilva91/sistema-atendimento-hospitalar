import Joi from 'joi';

// DTO para emitir ficha
export const emitirFichaSchema = Joi.object({
  pacienteId: Joi.string().required()
});

// DTO para listar fichas
export const getFichasSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(
    'AGUARDANDO_TRIAGEM',
    'EM_TRIAGEM', 
    'AGUARDANDO_AVALIACAO_MEDICA',
    'EM_CONSULTA',
    'ATENDIMENTO_CONCLUIDO',
    'AGUARDANDO_EXAME',
    'INTERNADO',
    'ENCAMINHADO'
  ),
  corTriagem: Joi.string().valid('VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL'),
  search: Joi.string().max(255)
});

// DTO para buscar ficha por ID
export const getFichaByIdSchema = Joi.object({
  id: Joi.string().required()
});
