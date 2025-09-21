import { DashboardService } from '../services/dashboardService.js';
import { logger } from '../utils/logger.js';

export class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  async overview(req, res, next) {
    try {
      const overview = await this.dashboardService.overview();

      res.json({
        success: true,
        data: overview,
        message: 'Visão geral obtida com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter overview:', error);
      next(error);
    }
  }

  async estatisticas(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query;
      const estatisticas = await this.dashboardService.estatisticas(dataInicio, dataFim);

      res.json({
        success: true,
        data: estatisticas,
        message: 'Estatísticas obtidas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      next(error);
    }
  }

  async statusFilas(req, res, next) {
    try {
      const filas = await this.dashboardService.statusFilas();

      res.json({
        success: true,
        data: filas,
        message: 'Status das filas obtido com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter status das filas:', error);
      next(error);
    }
  }

  async atendimentosHoje(req, res, next) {
    try {
      const { medicoId } = req.query;
      const atendimentos = await this.dashboardService.atendimentosHoje(medicoId);

      res.json({
        success: true,
        data: atendimentos,
        message: 'Atendimentos de hoje obtidos com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter atendimentos de hoje:', error);
      next(error);
    }
  }

  async triagensHoje(req, res, next) {
    try {
      const { enfermeiroId } = req.query;
      const triagens = await this.dashboardService.triagensHoje(enfermeiroId);

      res.json({
        success: true,
        data: triagens,
        message: 'Triagens de hoje obtidas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter triagens de hoje:', error);
      next(error);
    }
  }

  async senhasHoje(req, res, next) {
    try {
      const { tipo } = req.query;
      const senhas = await this.dashboardService.senhasHoje(tipo);

      res.json({
        success: true,
        data: senhas,
        message: 'Senhas de hoje obtidas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter senhas de hoje:', error);
      next(error);
    }
  }

  async medicosAtivos(req, res, next) {
    try {
      const medicos = await this.dashboardService.medicosAtivos();

      res.json({
        success: true,
        data: medicos,
        message: 'Médicos ativos obtidos com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter médicos ativos:', error);
      next(error);
    }
  }

  async pacientesRecentes(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const pacientes = await this.dashboardService.pacientesRecentes(parseInt(limit));

      res.json({
        success: true,
        data: pacientes,
        message: 'Pacientes recentes obtidos com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter pacientes recentes:', error);
      next(error);
    }
  }

  async alertas(req, res, next) {
    try {
      const alertas = await this.dashboardService.alertas();

      res.json({
        success: true,
        data: alertas,
        message: 'Alertas obtidos com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter alertas:', error);
      next(error);
    }
  }

  async relatorios(req, res, next) {
    try {
      const relatorios = await this.dashboardService.relatorios();

      res.json({
        success: true,
        data: relatorios,
        message: 'Relatórios obtidos com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter relatórios:', error);
      next(error);
    }
  }
}
