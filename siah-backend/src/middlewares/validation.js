// Joi importado para uso nos DTOs
import { loginSchema, registerSchema, updateUsuarioSchema } from '../dto/auth.dto.js';
import { 
  createPacienteSchema, 
  updatePacienteSchema, 
  getPacientesSchema,
  getPacienteByIdSchema,
  getFilaTriagemSchema,
  getFilaMedicoSchema
} from '../dto/pacientes.dto.js';
import { 
  iniciarAtendimentoSchema, 
  finalizarAtendimentoSchema, 
  getAtendimentoEstatisticasSchema
} from '../dto/atendimento.dto.js';
import { 
  iniciarTriagemSchema, 
  finalizarTriagemSchema, 
  getTriagemEstatisticasSchema
} from '../dto/triagem.dto.js';
import { 
  createSenhaSchema, 
  updateSenhaStatusSchema, 
  chamarSenhaSchema,
  getSenhasSchema
} from '../dto/senhas.dto.js';
import { 
  emitirFichaSchema, 
  getFichasSchema, 
  getFichaByIdSchema
} from '../dto/fichas.dto.js';
import { 
  createChamadaSchema, 
  finalizarChamadaSchema, 
  getChamadasAtivasSchema
} from '../dto/chamadas.dto.js';
import { 
  getEstatisticasSchema, 
  getPainelPublicoSchema, 
  getRelatorioSchema
} from '../dto/dashboard.dto.js';

export const validate = (schema, property = 'body') => {
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
export const validateAuth = validate(loginSchema);
export const validateRegister = validate(registerSchema);
export const validateUpdateUsuario = validate(updateUsuarioSchema);

// Validações de pacientes
export const validateCreatePaciente = validate(createPacienteSchema);
export const validateUpdatePaciente = validate(updatePacienteSchema);
export const validateGetPacientes = validate(getPacientesSchema, 'query');
export const validateGetPacienteById = validate(getPacienteByIdSchema, 'params');
export const validateFilaTriagem = validate(getFilaTriagemSchema, 'query');
export const validateFilaMedico = validate(getFilaMedicoSchema, 'query');

// Validações de atendimentos
export const validateIniciarAtendimento = validate(iniciarAtendimentoSchema);
export const validateFinalizarAtendimento = validate(finalizarAtendimentoSchema);
export const validateAtendimentoEstatisticas = validate(getAtendimentoEstatisticasSchema, 'query');

// Validações de triagem
export const validateIniciarTriagem = validate(iniciarTriagemSchema);
export const validateFinalizarTriagem = validate(finalizarTriagemSchema);
export const validateTriagemEstatisticas = validate(getTriagemEstatisticasSchema, 'query');

// Validações de senhas
export const validateCreateSenha = validate(createSenhaSchema);
export const validateUpdateSenhaStatus = validate(updateSenhaStatusSchema);
export const validateChamarSenha = validate(chamarSenhaSchema);
export const validateGetSenhas = validate(getSenhasSchema, 'query');

// Validações de fichas
export const validateEmitirFicha = validate(emitirFichaSchema);
export const validateGetFichas = validate(getFichasSchema, 'query');
export const validateGetFichaById = validate(getFichaByIdSchema, 'params');

// Validações de chamadas
export const validateCreateChamada = validate(createChamadaSchema);
export const validateFinalizarChamada = validate(finalizarChamadaSchema);
export const validateGetChamadasAtivas = validate(getChamadasAtivasSchema, 'query');

// Validações de dashboard
export const validateEstatisticas = validate(getEstatisticasSchema, 'query');
export const validatePainelPublico = validate(getPainelPublicoSchema, 'query');
export const validateRelatorio = validate(getRelatorioSchema);
