import { AtendimentoService } from '../services/atendimentoService.js';
import { logger } from '../utils/logger.js';

export class AtendimentoController {
  constructor() {
    this.atendimentoService = new AtendimentoService();
  }

  async iniciarAtendimento(req, res) {
    try {
      const { pacienteId } = req.body;
      const { id: usuarioId } = req.user;

      const resultado = await this.atendimentoService.iniciarAtendimento(pacienteId, usuarioId);

      logger.info(`Atendimento iniciado para paciente ${pacienteId} pelo usuário ${usuarioId}`);
      res.json({
        success: true,
        data: resultado,
        message: 'Atendimento iniciado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao iniciar atendimento:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async finalizarAtendimento(req, res) {
    try {
      const dadosAtendimento = req.body;
      const { id: usuarioId } = req.user;

      const resultado = await this.atendimentoService.finalizarAtendimento(dadosAtendimento, usuarioId);

      logger.info(`Atendimento finalizado para paciente ${dadosAtendimento.pacienteId} pelo usuário ${usuarioId}`);
      res.json({
        success: true,
        data: resultado,
        message: 'Atendimento finalizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao finalizar atendimento:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarFilaMedico(req, res) {
    try {
      const { limit = 50 } = req.query;
      const pacientes = await this.atendimentoService.listarFilaMedico(parseInt(limit));

      res.json({
        success: true,
        data: pacientes
      });
    } catch (error) {
      logger.error('Erro ao listar fila de médico:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obterEstatisticasAtendimento(req, res) {
    try {
      const filtros = req.query;
      const estatisticas = await this.atendimentoService.obterEstatisticasAtendimento(filtros);

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de atendimento:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async buscarAtendimentoPorPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const atendimentos = await this.atendimentoService.buscarAtendimentoPorPaciente(pacienteId);

      res.json({
        success: true,
        data: atendimentos
      });
    } catch (error) {
      logger.error('Erro ao buscar atendimentos:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async buscarProntuariosPorPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const prontuarios = await this.atendimentoService.buscarProntuariosPorPaciente(pacienteId);

      res.json({
        success: true,
        data: prontuarios
      });
    } catch (error) {
      logger.error('Erro ao buscar prontuários:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}