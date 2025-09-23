import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    
    this.prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Event listeners para logs do Prisma
    this.prisma.$on('query', (e) => {
      logger.debug('Query: ' + e.query);
      logger.debug('Params: ' + e.params);
      logger.debug('Duration: ' + e.duration + 'ms');
    });

    this.prisma.$on('error', (e) => {
      logger.error('Prisma Error: ' + e.message);
    });

    this.prisma.$on('info', (e) => {
      logger.info('Prisma Info: ' + e.message);
    });

    this.prisma.$on('warn', (e) => {
      logger.warn('Prisma Warning: ' + e.message);
    });

    DatabaseConnection.instance = this;
  }

  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Database disconnection failed:', error);
      throw error;
    }
  }

  getPrisma() {
    return this.prisma;
  }
}

export const database = new DatabaseConnection();
export default database;