import { FichaService } from '../services/fichaService.js';
import { logger } from '../utils/logger.js';

export class FichaController {
  constructor() {
    this.fichaService = new FichaService();
  }

  async emitirFicha(req, res) {
    try {
      const { pacienteId } = req.body;
      const ficha = await this.fichaService.emitirFicha(pacienteId);

      logger.info(`Ficha ${ficha.numeroFicha} emitida para paciente ${pacienteId}`);
      res.status(201).json({
        success: true,
        data: ficha,
        message: 'Ficha emitida com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao emitir ficha:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarFichas(req, res) {
    try {
      const filtros = req.query;
      const resultado = await this.fichaService.listarFichas(filtros);

      res.json({
        success: true,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      logger.error('Erro ao listar fichas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async buscarFichaPorId(req, res) {
    try {
      const { id } = req.params;
      const ficha = await this.fichaService.buscarFichaPorId(id);

      res.json({
        success: true,
        data: ficha
      });
    } catch (error) {
      logger.error('Erro ao buscar ficha:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async atualizarStatusFicha(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const ficha = await this.fichaService.atualizarStatusFicha(id, status);

      logger.info(`Status da ficha ${ficha.numeroFicha} atualizado para ${status}`);
      res.json({
        success: true,
        data: ficha,
        message: 'Status da ficha atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar status da ficha:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async obterEstatisticasFichas(req, res) {
    try {
      const estatisticas = await this.fichaService.obterEstatisticasFichas();

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de fichas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
