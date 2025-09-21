import { SenhaService } from '../services/senhaService.js';
import { logger } from '../utils/logger.js';

export class SenhaController {
  constructor() {
    this.senhaService = new SenhaService();
  }

  async listarSenhas(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        tipo, 
        status, 
        dataInicio, 
        dataFim,
        pacienteId 
      } = req.query;

      const filtros = {
        tipo,
        status,
        dataInicio,
        dataFim,
        pacienteId
      };

      const result = await this.senhaService.listarSenhas({
        page: parseInt(page),
        limit: parseInt(limit),
        filtros
      });

      res.json({
        success: true,
        data: result,
        message: 'Senhas listadas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar senhas:', error);
      next(error);
    }
  }

  async buscarSenha(req, res, next) {
    try {
      const { id } = req.params;
      const senha = await this.senhaService.buscarSenha(id);

      if (!senha) {
        return res.status(404).json({
          success: false,
          error: 'Senha não encontrada'
        });
      }

      res.json({
        success: true,
        data: senha,
        message: 'Senha encontrada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao buscar senha:', error);
      next(error);
    }
  }

  async gerarSenha(req, res, next) {
    try {
      const dadosSenha = {
        ...req.body,
        geradaPor: req.user.id // Usuário logado
      };

      const senha = await this.senhaService.gerarSenha(dadosSenha);

      res.status(201).json({
        success: true,
        data: senha,
        message: 'Senha gerada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao gerar senha:', error);
      next(error);
    }
  }

  async atualizarSenha(req, res, next) {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const senha = await this.senhaService.atualizarSenha(id, dadosAtualizacao);

      res.json({
        success: true,
        data: senha,
        message: 'Senha atualizada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar senha:', error);
      next(error);
    }
  }

  async atualizarStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const senha = await this.senhaService.atualizarStatus(id, status);

      res.json({
        success: true,
        data: senha,
        message: 'Status da senha atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar status da senha:', error);
      next(error);
    }
  }

  async cancelarSenha(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      await this.senhaService.cancelarSenha(id, motivo);

      res.json({
        success: true,
        message: 'Senha cancelada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao cancelar senha:', error);
      next(error);
    }
  }

  async filaAguardando(req, res, next) {
    try {
      const fila = await this.senhaService.filaAguardando();

      res.json({
        success: true,
        data: fila,
        message: 'Fila de senhas obtida com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter fila de senhas:', error);
      next(error);
    }
  }

  async senhasHoje(req, res, next) {
    try {
      const { tipo } = req.query;
      const senhas = await this.senhaService.senhasHoje(tipo);

      res.json({
        success: true,
        data: senhas,
        message: 'Senhas de hoje listadas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar senhas de hoje:', error);
      next(error);
    }
  }

  async chamarSenha(req, res, next) {
    try {
      const { id } = req.params;
      const senha = await this.senhaService.chamarSenha(id, req.user.id);

      res.json({
        success: true,
        data: senha,
        message: 'Senha chamada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao chamar senha:', error);
      next(error);
    }
  }

  async atenderSenha(req, res, next) {
    try {
      const { id } = req.params;
      const senha = await this.senhaService.atenderSenha(id, req.user.id);

      res.json({
        success: true,
        data: senha,
        message: 'Senha marcada como atendida com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atender senha:', error);
      next(error);
    }
  }

  async estatisticasSenhas(req, res, next) {
    try {
      const { dataInicio, dataFim } = req.query;
      const estatisticas = await this.senhaService.estatisticasSenhas(dataInicio, dataFim);

      res.json({
        success: true,
        data: estatisticas,
        message: 'Estatísticas de senhas obtidas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de senhas:', error);
      next(error);
    }
  }

  async senhasPorTipo(req, res, next) {
    try {
      const { tipo } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.senhaService.senhasPorTipo(tipo, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result,
        message: `Senhas do tipo ${tipo} listadas com sucesso`
      });
    } catch (error) {
      logger.error('Erro ao listar senhas por tipo:', error);
      next(error);
    }
  }

  async senhasPorPaciente(req, res, next) {
    try {
      const { pacienteId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.senhaService.senhasPorPaciente(pacienteId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result,
        message: 'Senhas do paciente listadas com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao listar senhas do paciente:', error);
      next(error);
    }
  }
}
