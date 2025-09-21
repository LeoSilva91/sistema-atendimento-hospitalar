import { ProntuarioService } from '../services/prontuarioService.js';
import { logger } from '../utils/logger.js';

export class ProntuarioController {
  constructor() {
    this.prontuarioService = new ProntuarioService();
  }

  async listarProntuarios(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        pacienteId, 
        medicoId, 
        atendimentoId,
        dataInicio, 
        dataFim 
      } = req.query;

      const filtros = {
        pacienteId,
        medicoId,
        atendimentoId,
        dataInicio,
        dataFim
      };

      const result = await this.prontuarioService.listarProntuarios({
        page: parseInt(page),
        limit: parseInt(limit),
        filtros
      });

      res.json({
        success: true,
        data: result,
        message: 'Prontuários listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar prontuários:', error);
      next(error);
    }
  }

  async buscarProntuario(req, res, next) {
    try {
      const { id } = req.params;
      const prontuario = await this.prontuarioService.buscarProntuario(id);

      if (!prontuario) {
        return res.status(404).json({
          success: false,
          error: 'Prontuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: prontuario,
        message: 'Prontuário encontrado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao buscar prontuário:', error);
      next(error);
    }
  }

  async criarProntuario(req, res, next) {
    try {
      const dadosProntuario = {
        ...req.body,
        medicoId: req.user.id // Médico logado
      };

      const prontuario = await this.prontuarioService.criarProntuario(dadosProntuario);

      res.status(201).json({
        success: true,
        data: prontuario,
        message: 'Prontuário criado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao criar prontuário:', error);
      next(error);
    }
  }

  async atualizarProntuario(req, res, next) {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const prontuario = await this.prontuarioService.atualizarProntuario(id, dadosAtualizacao);

      res.json({
        success: true,
        data: prontuario,
        message: 'Prontuário atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar prontuário:', error);
      next(error);
    }
  }

  async excluirProntuario(req, res, next) {
    try {
      const { id } = req.params;
      await this.prontuarioService.excluirProntuario(id);

      res.json({
        success: true,
        message: 'Prontuário excluído com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao excluir prontuário:', error);
      next(error);
    }
  }

  async prontuariosPorPaciente(req, res, next) {
    try {
      const { pacienteId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.prontuarioService.prontuariosPorPaciente(pacienteId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result,
        message: 'Prontuários do paciente listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar prontuários do paciente:', error);
      next(error);
    }
  }

  async prontuariosPorAtendimento(req, res, next) {
    try {
      const { atendimentoId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.prontuarioService.prontuariosPorAtendimento(atendimentoId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result,
        message: 'Prontuários do atendimento listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar prontuários do atendimento:', error);
      next(error);
    }
  }

  async prontuariosPorMedico(req, res, next) {
    try {
      const { medicoId } = req.params;
      const { page = 1, limit = 10, dataInicio, dataFim } = req.query;

      const result = await this.prontuarioService.prontuariosPorMedico(medicoId, {
        page: parseInt(page),
        limit: parseInt(limit),
        dataInicio,
        dataFim
      });

      res.json({
        success: true,
        data: result,
        message: 'Prontuários do médico listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar prontuários do médico:', error);
      next(error);
    }
  }

  async prontuariosHoje(req, res, next) {
    try {
      const { medicoId } = req.query;
      const prontuarios = await this.prontuarioService.prontuariosHoje(medicoId);

      res.json({
        success: true,
        data: prontuarios,
        message: 'Prontuários de hoje listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar prontuários de hoje:', error);
      next(error);
    }
  }

  async adicionarEvolucao(req, res, next) {
    try {
      const { id } = req.params;
      const { evolucao } = req.body;

      const prontuario = await this.prontuarioService.adicionarEvolucao(id, evolucao, req.user.id);

      res.json({
        success: true,
        data: prontuario,
        message: 'Evolução adicionada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao adicionar evolução:', error);
      next(error);
    }
  }

  async estatisticasProntuarios(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query;
      const estatisticas = await this.prontuarioService.estatisticasProntuarios(dataInicio, dataFim);

      res.json({
        success: true,
        data: estatisticas,
        message: 'Estatísticas de prontuários obtidas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de prontuários:', error);
      next(error);
    }
  }
}
