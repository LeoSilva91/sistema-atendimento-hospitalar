import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de acesso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        nome: true, 
        tipo: true, 
        ativo: true 
      }
    });

    if (!user || !user.ativo) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuário inválido' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    return res.status(403).json({ 
      success: false,
      error: 'Token inválido' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuário não autenticado' 
      });
    }

    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({ 
        success: false,
        error: 'Acesso negado' 
      });
    }

    next();
  };
};