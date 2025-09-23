import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export class AuthService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async login(email, senha) {
    try {
      // Buscar usuário
      const usuario = await this.prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario || !usuario.ativo) {
        throw new Error('Credenciais inválidas');
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        throw new Error('Credenciais inválidas');
      }

      // Gerar tokens
      const accessToken = this.generateAccessToken(usuario);
      const refreshToken = this.generateRefreshToken(usuario);

      // Salvar refresh token no banco
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { refreshToken }
      });

      logger.info(`Login realizado: ${usuario.email}`);
      
      return {
        accessToken,
        refreshToken,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        }
      };
    } catch (error) {
      logger.error('Erro no login:', error);
      throw error;
    }
  }

  async register(data) {
    try {
      // Verificar se email já existe
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Criptografar senha
      const senhaHash = await bcrypt.hash(data.senha, 12);

      // Criar usuário
      const usuario = await this.prisma.usuario.create({
        data: {
          ...data,
          senha: senhaHash
        }
      });

      logger.info(`Usuário registrado: ${usuario.email}`);
      
      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      };
    } catch (error) {
      logger.error('Erro no registro:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: decoded.userId }
      });

      if (!usuario || usuario.refreshToken !== refreshToken) {
        throw new Error('Refresh token inválido');
      }

      const newAccessToken = this.generateAccessToken(usuario);
      
      return { accessToken: newAccessToken };
    } catch (error) {
      logger.error('Erro no refresh token:', error);
      throw error;
    }
  }

  generateAccessToken(usuario) {
    return jwt.sign(
      { 
        userId: usuario.id, 
        email: usuario.email, 
        tipo: usuario.tipo 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  generateRefreshToken(usuario) {
    return jwt.sign(
      { userId: usuario.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }
}