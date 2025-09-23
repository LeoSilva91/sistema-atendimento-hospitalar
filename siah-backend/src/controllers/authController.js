import { AuthService } from '../services/authService.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const result = await this.authService.login(email, senha);
      
      res.json({
        success: true,
        data: result,
        message: 'Login realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const usuario = await this.authService.register(req.body);
      
      res.status(201).json({
        success: true,
        data: usuario,
        message: 'Usuário registrado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: result,
        message: 'Token renovado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // Implementar logout (invalidar refresh token)
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}
