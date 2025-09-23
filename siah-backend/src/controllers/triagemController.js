import { TriagemService } from '../services/triagemService.js';
import { logger } from '../utils/logger.js';

export class TriagemController {
  constructor() {
    this.triagemService = new TriagemService();
  }

  async iniciarTriagem(req, res) {
    try {
      const { pacienteId } = req.body;
      const { id: usuarioId } = req.user;

      const paciente = await this.triagemService.iniciarTriagem(pacienteId, usuarioId);

      logger.info(`Triagem iniciada para paciente ${pacienteId} pelo usuário ${usuarioId}`);
      res.json({
        success: true,
        data: paciente,
        message: 'Triagem iniciada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao iniciar triagem:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async finalizarTriagem(req, res) {
    try {
      const dadosTriagem = req.body;
      const { id: usuarioId } = req.user;

      const resultado = await this.triagemService.finalizarTriagem(dadosTriagem, usuarioId);

      logger.info(`Triagem finalizada para paciente ${dadosTriagem.pacienteId} pelo usuário ${usuarioId}`);
      res.json({
        success: true,
        data: resultado,
        message: 'Triagem finalizada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao finalizar triagem:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarFilaTriagem(req, res) {
    try {
      const { limit = 50 } = req.query;
      const pacientes = await this.triagemService.listarFilaTriagem(parseInt(limit));

      res.json({
        success: true,
        data: pacientes
      });
    } catch (error) {
      logger.error('Erro ao listar fila de triagem:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obterEstatisticasTriagem(req, res) {
    try {
      const filtros = req.query;
      const estatisticas = await this.triagemService.obterEstatisticasTriagem(filtros);

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de triagem:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async buscarTriagemPorPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const triagem = await this.triagemService.buscarTriagemPorPaciente(pacienteId);

      res.json({
        success: true,
        data: triagem
      });
    } catch (error) {
      logger.error('Erro ao buscar triagem:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}