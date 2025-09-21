import { AtendimentoService } from '../services/atendimentoService.js';
import { logger } from '../utils/logger.js';

export class AtendimentoController {
  constructor() {
    this.atendimentoService = new AtendimentoService();
  }

  async listarAtendimentos(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        dataInicio, 
        dataFim,
        medicoId,
        pacienteId 
      } = req.query;

      const filtros = {
        status,
        dataInicio,
        dataFim,
        medicoId,
        pacienteId
      };

      const result = await this.atendimentoService.listarAtendimentos({
        page: parseInt(page),
        limit: parseInt(limit),
        filtros
      });

      res.json({
        success: true,
        data: result,
        message: 'Atendimentos listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar atendimentos:', error);
      next(error);
    }
  }

  async buscarAtendimento(req, res, next) {
    try {
      const { id } = req.params;
      const atendimento = await this.atendimentoService.buscarAtendimento(id);

      if (!atendimento) {
        return res.status(404).json({
          success: false,
          error: 'Atendimento não encontrado'
        });
      }

      res.json({
        success: true,
        data: atendimento,
        message: 'Atendimento encontrado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao buscar atendimento:', error);
      next(error);
    }
  }

  async criarAtendimento(req, res, next) {
    try {
      const dadosAtendimento = {
        ...req.body,
        medicoId: req.user.id // Médico logado
      };

      const atendimento = await this.atendimentoService.criarAtendimento(dadosAtendimento);

      res.status(201).json({
        success: true,
        data: atendimento,
        message: 'Atendimento criado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao criar atendimento:', error);
      next(error);
    }
  }

  async atualizarAtendimento(req, res, next) {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const atendimento = await this.atendimentoService.atualizarAtendimento(id, dadosAtualizacao);

      res.json({
        success: true,
        data: atendimento,
        message: 'Atendimento atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar atendimento:', error);
      next(error);
    }
  }

  async atualizarStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const atendimento = await this.atendimentoService.atualizarStatus(id, status);

      res.json({
        success: true,
        data: atendimento,
        message: 'Status do atendimento atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar status:', error);
      next(error);
    }
  }

  async cancelarAtendimento(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      await this.atendimentoService.cancelarAtendimento(id, motivo);

      res.json({
        success: true,
        message: 'Atendimento cancelado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao cancelar atendimento:', error);
      next(error);
    }
  }

  async atendimentosPorPaciente(req, res, next) {
    try {
      const { pacienteId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.atendimentoService.atendimentosPorPaciente(pacienteId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result,
        message: 'Atendimentos do paciente listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar atendimentos do paciente:', error);
      next(error);
    }
  }

  async atendimentosPorMedico(req, res, next) {
    try {
      const { medicoId } = req.params;
      const { page = 1, limit = 10, dataInicio, dataFim } = req.query;

      const result = await this.atendimentoService.atendimentosPorMedico(medicoId, {
        page: parseInt(page),
        limit: parseInt(limit),
        dataInicio,
        dataFim
      });

      res.json({
        success: true,
        data: result,
        message: 'Atendimentos do médico listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar atendimentos do médico:', error);
      next(error);
    }
  }

  async atendimentosHoje(req, res, next) {
    try {
      const { medicoId } = req.query;
      const atendimentos = await this.atendimentoService.atendimentosHoje(medicoId);

      res.json({
        success: true,
        data: atendimentos,
        message: 'Atendimentos de hoje listados com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar atendimentos de hoje:', error);
      next(error);
    }
  }

  async iniciarAtendimento(req, res, next) {
    try {
      const { id } = req.params;
      const atendimento = await this.atendimentoService.iniciarAtendimento(id, req.user.id);

      res.json({
        success: true,
        data: atendimento,
        message: 'Atendimento iniciado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao iniciar atendimento:', error);
      next(error);
    }
  }

  async finalizarAtendimento(req, res, next) {
    try {
      const { id } = req.params;
      const { observacoes, diagnostico, prescricao } = req.body;

      const atendimento = await this.atendimentoService.finalizarAtendimento(id, {
        observacoes,
        diagnostico,
        prescricao,
        finalizadoPor: req.user.id
      });

      res.json({
        success: true,
        data: atendimento,
        message: 'Atendimento finalizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao finalizar atendimento:', error);
      next(error);
    }
  }
}
