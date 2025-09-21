// Joi importado para uso nos DTOs
import { authSchema, registerSchema } from '../dto/auth.dto.js';
import { pacienteSchema, atualizarPacienteSchema } from '../dto/pacientes.dto.js';
import { 
  criarAtendimentoSchema, 
  atualizarAtendimentoSchema, 
  atualizarStatusAtendimentoSchema,
  finalizarAtendimentoSchema,
  cancelarAtendimentoSchema 
} from '../dto/atendimentos.dto.js';
import { 
  criarTriagemSchema, 
  atualizarTriagemSchema, 
  classificarRiscoSchema 
} from '../dto/triagem.dto.js';
import { 
  gerarSenhaSchema, 
  atualizarSenhaSchema, 
  atualizarStatusSenhaSchema,
  cancelarSenhaSchema 
} from '../dto/senhas.dto.js';
import { 
  criarProntuarioSchema, 
  atualizarProntuarioSchema, 
  adicionarEvolucaoSchema 
} from '../dto/prontuarios.dto.js';

export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    next();
  };
};

// Validações de autenticação
export const validateAuth = validateRequest(authSchema);
export const validateRegister = validateRequest(registerSchema);

// Validações de pacientes
export const validatePaciente = validateRequest(pacienteSchema);
export const validateAtualizarPaciente = validateRequest(atualizarPacienteSchema);

// Validações de atendimentos
export const validateAtendimento = validateRequest(criarAtendimentoSchema);
export const validateAtualizarAtendimento = validateRequest(atualizarAtendimentoSchema);
export const validateStatusAtendimento = validateRequest(atualizarStatusAtendimentoSchema);
export const validateFinalizarAtendimento = validateRequest(finalizarAtendimentoSchema);
export const validateCancelarAtendimento = validateRequest(cancelarAtendimentoSchema);

// Validações de triagem
export const validateTriagem = validateRequest(criarTriagemSchema);
export const validateAtualizarTriagem = validateRequest(atualizarTriagemSchema);
export const validateClassificarRisco = validateRequest(classificarRiscoSchema);

// Validações de senhas
export const validateSenha = validateRequest(gerarSenhaSchema);
export const validateAtualizarSenha = validateRequest(atualizarSenhaSchema);
export const validateStatusSenha = validateRequest(atualizarStatusSenhaSchema);
export const validateCancelarSenha = validateRequest(cancelarSenhaSchema);

// Validações de prontuários
export const validateProntuario = validateRequest(criarProntuarioSchema);
export const validateAtualizarProntuario = validateRequest(atualizarProntuarioSchema);
export const validateAdicionarEvolucao = validateRequest(adicionarEvolucaoSchema);
