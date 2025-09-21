import { TriagemService } from '../services/triagemService.js';
import { logger } from '../utils/logger.js';

export class TriagemController {
  constructor() {
    this.triagemService = new TriagemService();
  }

  async listarTriagens(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        nivelRisco, 
        dataInicio, 
        dataFim,
        enfermeiroId,
        pacienteId 
      } = req.query;

      const filtros = {
        nivelRisco,
        dataInicio,
        dataFim,
        enfermeiroId,
        pacienteId
      };

      const result = await this.triagemService.listarTriagens({
        page: parseInt(page),
        limit: parseInt(limit),
        filtros
      });

      res.json({
        success: true,
        data: result,
        message: 'Triagens listadas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar triagens:', error);
      next(error);
    }
  }

  async buscarTriagem(req, res, next) {
    try {
      const { id } = req.params;
      const triagem = await this.triagemService.buscarTriagem(id);

      if (!triagem) {
        return res.status(404).json({
          success: false,
          error: 'Triagem não encontrada'
        });
      }

      res.json({
        success: true,
        data: triagem,
        message: 'Triagem encontrada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao buscar triagem:', error);
      next(error);
    }
  }

  async criarTriagem(req, res, next) {
    try {
      const dadosTriagem = {
        ...req.body,
        enfermeiroId: req.user.id // Enfermeiro logado
      };

      const triagem = await this.triagemService.criarTriagem(dadosTriagem);

      res.status(201).json({
        success: true,
        data: triagem,
        message: 'Triagem criada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao criar triagem:', error);
      next(error);
    }
  }

  async atualizarTriagem(req, res, next) {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const triagem = await this.triagemService.atualizarTriagem(id, dadosAtualizacao);

      res.json({
        success: true,
        data: triagem,
        message: 'Triagem atualizada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar triagem:', error);
      next(error);
    }
  }

  async triagensPorPaciente(req, res, next) {
    try {
      const { pacienteId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.triagemService.triagensPorPaciente(pacienteId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result,
        message: 'Triagens do paciente listadas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar triagens do paciente:', error);
      next(error);
    }
  }

  async triagensHoje(req, res, next) {
    try {
      const { enfermeiroId } = req.query;
      const triagens = await this.triagemService.triagensHoje(enfermeiroId);

      res.json({
        success: true,
        data: triagens,
        message: 'Triagens de hoje listadas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar triagens de hoje:', error);
      next(error);
    }
  }

  async filaTriagem(req, res, next) {
    try {
      const fila = await this.triagemService.filaTriagem();

      res.json({
        success: true,
        data: fila,
        message: 'Fila de triagem obtida com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter fila de triagem:', error);
      next(error);
    }
  }

  async classificarRisco(req, res, next) {
    try {
      const { id } = req.params;
      const { nivelRisco, observacoes } = req.body;

      const triagem = await this.triagemService.classificarRisco(id, nivelRisco, observacoes);

      res.json({
        success: true,
        data: triagem,
        message: 'Risco classificado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao classificar risco:', error);
      next(error);
    }
  }

  async estatisticasTriagem(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query;
      const estatisticas = await this.triagemService.estatisticasTriagem(dataInicio, dataFim);

      res.json({
        success: true,
        data: estatisticas,
        message: 'Estatísticas de triagem obtidas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de triagem:', error);
      next(error);
    }
  }

  async triagensPorRisco(req, res, next) {
    try {
      const { nivelRisco } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.triagemService.triagensPorRisco(nivelRisco, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result,
        message: `Triagens de risco ${nivelRisco} listadas com sucesso`
      });
    } catch (error) {
      logger.error('Erro ao listar triagens por risco:', error);
      next(error);
    }
  }
}
