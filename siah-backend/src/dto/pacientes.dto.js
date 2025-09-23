import Joi from 'joi';

// DTO para criar paciente
export const createPacienteSchema = Joi.object({
  nome: Joi.string().max(255).required(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required(),
  rg: Joi.string().max(20).optional(),
  dataNascimento: Joi.date().max('now').required(),
  sexo: Joi.string().valid('MASCULINO', 'FEMININO', 'OUTRO').required(),
  nomeMae: Joi.string().max(255).optional(),
  telefone: Joi.string().max(20).required(),
  email: Joi.string().email().max(255).optional(),
  endereco: Joi.string().max(500).required(),
  cidade: Joi.string().max(100).optional(),
  estado: Joi.string().max(2).optional(),
  cep: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional(),
  contatoEmergencia: Joi.string().max(20).optional(),
  convenio: Joi.string().max(100).optional(),
  numeroCarteirinha: Joi.string().max(50).optional(),
  motivoVisita: Joi.string().max(1000).optional(),
  sintomas: Joi.array().items(Joi.string().max(255)).optional()
});

// DTO para atualizar paciente
export const updatePacienteSchema = Joi.object({
  nome: Joi.string().max(255).optional(),
  telefone: Joi.string().max(20).optional(),
  email: Joi.string().email().max(255).optional(),
  endereco: Joi.string().max(500).optional(),
  cidade: Joi.string().max(100).optional(),
  estado: Joi.string().max(2).optional(),
  cep: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional(),
  contatoEmergencia: Joi.string().max(20).optional(),
  convenio: Joi.string().max(100).optional(),
  numeroCarteirinha: Joi.string().max(50).optional()
});

// DTO para listar pacientes
export const getPacientesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(255).optional(),
  status: Joi.string().valid(
    'AGUARDANDO_TRIAGEM',
    'EM_TRIAGEM', 
    'AGUARDANDO_AVALIACAO_MEDICA',
    'EM_CONSULTA',
    'ATENDIMENTO_CONCLUIDO',
    'AGUARDANDO_EXAME',
    'INTERNADO',
    'ENCAMINHADO'
  ).optional(),
  sexo: Joi.string().valid('MASCULINO', 'FEMININO', 'OUTRO').optional(),
  corTriagem: Joi.string().valid('VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL').optional(),
  ativo: Joi.boolean().optional()
});

// DTO para buscar paciente por ID
export const getPacienteByIdSchema = Joi.object({
  id: Joi.string().required()
});

// DTO para fila de triagem
export const getFilaTriagemSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50)
});

// DTO para fila de médico
export const getFilaMedicoSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50)
});