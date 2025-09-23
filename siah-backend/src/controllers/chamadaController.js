import { ChamadaService } from '../services/chamadaService.js';
import { logger } from '../utils/logger.js';

export class ChamadaController {
  constructor() {
    this.chamadaService = new ChamadaService();
  }

  async criarChamada(req, res) {
    try {
      const dadosChamada = req.body;
      const { id: usuarioId } = req.user;

      const chamada = await this.chamadaService.criarChamada(dadosChamada, usuarioId);

      logger.info(`Chamada criada para paciente ${dadosChamada.pacienteId} pelo usuário ${usuarioId}`);
      res.status(201).json({
        success: true,
        data: chamada,
        message: 'Chamada criada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao criar chamada:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarChamadasAtivas(req, res) {
    try {
      const filtros = req.query;
      const chamadas = await this.chamadaService.listarChamadasAtivas(filtros);

      res.json({
        success: true,
        data: chamadas
      });
    } catch (error) {
      logger.error('Erro ao listar chamadas ativas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async finalizarChamada(req, res) {
    try {
      const { chamadaId } = req.body;
      const chamada = await this.chamadaService.finalizarChamada(chamadaId);

      logger.info(`Chamada ${chamadaId} finalizada`);
      res.json({
        success: true,
        data: chamada,
        message: 'Chamada finalizada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao finalizar chamada:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async finalizarChamadasAntigas(req, res) {
    try {
      const count = await this.chamadaService.finalizarChamadasAntigas();

      logger.info(`${count} chamadas antigas finalizadas automaticamente`);
      res.json({
        success: true,
        data: { count },
        message: `${count} chamadas antigas finalizadas`
      });
    } catch (error) {
      logger.error('Erro ao finalizar chamadas antigas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async obterEstatisticasChamadas(req, res) {
    try {
      const estatisticas = await this.chamadaService.obterEstatisticasChamadas();

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de chamadas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async buscarChamadaPorId(req, res) {
    try {
      const { id } = req.params;
      const chamada = await this.chamadaService.buscarChamadaPorId(id);

      res.json({
        success: true,
        data: chamada
      });
    } catch (error) {
      logger.error('Erro ao buscar chamada:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}
