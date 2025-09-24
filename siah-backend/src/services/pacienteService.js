import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export class PacienteService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async createPaciente(data) {
    try {
      // Verificar se paciente já existe
      const existingPaciente = await this.prisma.paciente.findUnique({
        where: { cpf: data.cpf }
      });

      if (existingPaciente) {
        // Se paciente já existe, verificar se está aguardando triagem
        if (existingPaciente.status === 'AGUARDANDO_TRIAGEM') {
          logger.info(`Paciente já existe e está aguardando triagem: ${existingPaciente.id}`);
          return existingPaciente;
        }
        
        // Se paciente existe mas não está aguardando triagem, atualizar status
        const pacienteAtualizado = await this.prisma.paciente.update({
          where: { id: existingPaciente.id },
          data: {
            status: 'AGUARDANDO_TRIAGEM',
            horaCadastro: new Date(),
            motivoVisita: data.motivoVisita || existingPaciente.motivoVisita,
            sintomas: data.sintomas || existingPaciente.sintomas
          }
        });
        
        logger.info(`Paciente existente atualizado para aguardando triagem: ${pacienteAtualizado.id}`);
        return pacienteAtualizado;
      }

      // Gerar número do prontuário
      const ano = new Date().getFullYear();
      const timestamp = Date.now();
      const numeroProntuario = `P${ano}${timestamp.toString().slice(-4)}`;

      // Criação do paciente
      const paciente = await this.prisma.paciente.create({
        data: {
          ...data,
          numeroProntuario,
          cpf: data.cpf.replace(/\D/g, ''), // Remove formatação
          telefone: data.telefone?.replace(/\D/g, ''),
          contatoEmergencia: data.contatoEmergencia?.replace(/\D/g, ''),
          sintomas: data.sintomas || []
        }
      });

      logger.info(`Paciente criado: ${paciente.id}`);
      return paciente;
    } catch (error) {
      logger.error('Erro ao criar paciente:', error);
      throw error;
    }
  }

  async getPacientes({ page = 1, limit = 10, search, sexo, ativo } = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        ...(search && {
          OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(sexo && { sexo }),
        ...(ativo !== undefined && { ativo })
      };

      const [pacientes, total] = await Promise.all([
        this.prisma.paciente.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            nome: true,
            cpf: true,
            dataNascimento: true,
            sexo: true,
            telefone: true,
            email: true,
            ativo: true,
            createdAt: true
          }
        }),
        this.prisma.paciente.count({ where })
      ]);

      return {
        data: pacientes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  async getPacienteById(id) {
    try {
      const paciente = await this.prisma.paciente.findUnique({
        where: { id },
        include: {
          senhas: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          atendimentos: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              usuario: {
                select: { nome: true, tipo: true }
              }
            }
          }
        }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      return paciente;
    } catch (error) {
      logger.error('Erro ao buscar paciente:', error);
      throw error;
    }
  }

  async updatePaciente(id, data) {
    try {
      const paciente = await this.prisma.paciente.update({
        where: { id },
        data: {
          ...data,
          ...(data.cpf && { cpf: data.cpf.replace(/\D/g, '') })
        }
      });

      logger.info(`Paciente atualizado: ${id}`);
      return paciente;
    } catch (error) {
      logger.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  }

  async deletePaciente(id) {
    try {
      // Soft delete - apenas marca como inativo
      const paciente = await this.prisma.paciente.update({
        where: { id },
        data: { ativo: false }
      });

      logger.info(`Paciente desativado: ${id}`);
      return paciente;
    } catch (error) {
      logger.error('Erro ao deletar paciente:', error);
      throw error;
    }
  }

  async listarFilaTriagem(limit = 50) {
    try {
      const pacientes = await this.prisma.paciente.findMany({
        where: { status: 'AGUARDANDO_TRIAGEM' },
        orderBy: { horaCadastro: 'asc' },
        take: limit,
        select: {
          id: true,
          nome: true,
          cpf: true,
          dataNascimento: true,
          sexo: true,
          motivoVisita: true,
          horaCadastro: true,
          numeroProntuario: true
        }
      });

      return pacientes;
    } catch (error) {
      logger.error('Erro ao listar fila de triagem:', error);
      throw error;
    }
  }

  async listarFilaMedico(limit = 50) {
    try {
      const pacientes = await this.prisma.paciente.findMany({
        where: { status: 'AGUARDANDO_AVALIACAO_MEDICA' },
        orderBy: [
          { corTriagem: 'desc' }, // Prioridade por cor de triagem
          { horaFimTriagem: 'asc' } // FIFO dentro da mesma prioridade
        ],
        take: limit,
        select: {
          id: true,
          nome: true,
          cpf: true,
          dataNascimento: true,
          sexo: true,
          motivoVisita: true,
          queixaPrincipal: true,
          corTriagem: true,
          horaFimTriagem: true,
          numeroProntuario: true,
          sinaisVitais: true
        }
      });

      return pacientes;
    } catch (error) {
      logger.error('Erro ao listar fila de médico:', error);
      throw error;
    }
  }

  async obterEstatisticasPacientes() {
    try {
      const [
        total,
        porStatus,
        porCorTriagem,
        porSexo,
        cadastradosHoje
      ] = await Promise.all([
        this.prisma.paciente.count(),
        this.prisma.paciente.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        this.prisma.paciente.groupBy({
          by: ['corTriagem'],
          where: { corTriagem: { not: null } },
          _count: { corTriagem: true }
        }),
        this.prisma.paciente.groupBy({
          by: ['sexo'],
          _count: { sexo: true }
        }),
        this.prisma.paciente.count({
          where: {
            horaCadastro: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      return {
        total,
        cadastradosHoje,
        porStatus: porStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        porCorTriagem: porCorTriagem.reduce((acc, item) => {
          acc[item.corTriagem] = item._count.corTriagem;
          return acc;
        }, {}),
        porSexo: porSexo.reduce((acc, item) => {
          acc[item.sexo] = item._count.sexo;
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas de pacientes:', error);
      throw error;
    }
  }
}