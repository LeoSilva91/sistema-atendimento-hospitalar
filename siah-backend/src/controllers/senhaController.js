import { SenhaService } from '../services/senhaService.js';
import { logger } from '../utils/logger.js';

export class SenhaController {
  constructor() {
    this.senhaService = new SenhaService();
  }

  async gerarSenha(req, res) {
    try {
      const { tipo } = req.body;
      const senha = await this.senhaService.gerarSenha(tipo);

      logger.info(`Nova senha gerada: ${senha.prefixo}${senha.numero}`);
      res.status(201).json({
        success: true,
        data: senha,
        message: 'Senha gerada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao gerar senha:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarSenhasAguardando(req, res) {
    try {
      const senhas = await this.senhaService.listarSenhasAguardando();

      res.json({
        success: true,
        data: senhas
      });
    } catch (error) {
      logger.error('Erro ao listar senhas aguardando:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarSenhasChamadasPublico(req, res) {
    try {
      const senhas = await this.senhaService.listarSenhasChamadas();

      res.json({
        success: true,
        data: senhas
      });
    } catch (error) {
      logger.error('Erro ao listar senhas chamadas (público):', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async chamarSenha(req, res) {
    try {
      const { senhaId } = req.body;
      const { id: usuarioId } = req.user;

      const senha = await this.senhaService.chamarSenha(senhaId, usuarioId);

      logger.info(`Senha ${senha.prefixo}${senha.numero} chamada pelo usuário ${usuarioId}`);
      res.json({
        success: true,
        data: senha,
        message: 'Senha chamada com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao chamar senha:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async marcarSenhaCadastrada(req, res) {
    try {
      const { senhaId, pacienteId } = req.body;

      const senha = await this.senhaService.marcarSenhaCadastrada(senhaId, pacienteId);

      logger.info(`Senha ${senha.prefixo}${senha.numero} marcada como cadastrada`);
      res.json({
        success: true,
        data: senha,
        message: 'Senha marcada como cadastrada'
      });
    } catch (error) {
      logger.error('Erro ao marcar senha como cadastrada:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listarSenhas(req, res) {
    try {
      const filtros = req.query;
      const resultado = await this.senhaService.listarSenhas(filtros);

      res.json({
        success: true,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      logger.error('Erro ao listar senhas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async buscarSenhaPorId(req, res) {
    try {
      const { id } = req.params;
      const senha = await this.senhaService.buscarSenhaPorId(id);

      res.json({
        success: true,
        data: senha
      });
    } catch (error) {
      logger.error('Erro ao buscar senha:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async obterEstatisticasSenhas(req, res) {
    try {
      const estatisticas = await this.senhaService.obterEstatisticasSenhas();

      res.json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas de senhas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}