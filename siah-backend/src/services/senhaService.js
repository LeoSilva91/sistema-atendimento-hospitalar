import { database } from '../utils/database.js';
import { logger } from '../utils/logger.js';

export class SenhaService {
  constructor() {
    this.prisma = database.getPrisma();
  }

  async listarSenhas({ page, limit, filtros }) {
    try {
      const skip = (page - 1) * limit;
      
      const where = this.buildWhereClause(filtros);

      const [senhas, total] = await Promise.all([
        this.prisma.senha.findMany({
          where,
          include: {
            paciente: {
              select: {
                id: true,
                nome: true,
                cpf: true,
                dataNascimento: true,
                sexo: true,
                telefone: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.senha.count({ where })
      ]);

      return {
        senhas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar senhas:', error);
      throw error;
    }
  }

  async buscarSenha(id) {
    try {
      const senha = await this.prisma.senha.findUnique({
        where: { id },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              dataNascimento: true,
              sexo: true,
              telefone: true,
              email: true,
              endereco: true
            }
          }
        }
      });

      return senha;
    } catch (error) {
      logger.error('Erro ao buscar senha:', error);
      throw error;
    }
  }

  async gerarSenha(dadosSenha) {
    try {
      const { pacienteId, tipo, prioridade } = dadosSenha;

      // Verificar se o paciente existe
      const paciente = await this.prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      // Gerar número sequencial baseado no tipo
      const ultimaSenha = await this.prisma.senha.findFirst({
        where: { tipo },
        orderBy: { numero: 'desc' }
      });

      const numeroSenha = ultimaSenha ? ultimaSenha.numero + 1 : 1;

      const senha = await this.prisma.senha.create({
        data: {
          pacienteId,
          numero: numeroSenha,
          tipo: tipo || 'NORMAL',
          prioridade: prioridade || 'MEDIA',
          status: 'AGUARDANDO'
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              dataNascimento: true,
              sexo: true,
              telefone: true
            }
          }
        }
      });

      logger.info(`Senha gerada: ${tipo}${numeroSenha} para paciente ${paciente.nome}`);
      return senha;
    } catch (error) {
      logger.error('Erro ao gerar senha:', error);
      throw error;
    }
  }

  async atualizarSenha(id, dadosAtualizacao) {
    try {
      const senha = await this.prisma.senha.update({
        where: { id },
        data: {
          ...dadosAtualizacao,
          updatedAt: new Date()
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              dataNascimento: true,
              sexo: true,
              telefone: true
            }
          }
        }
      });

      logger.info(`Senha atualizada: ${id}`);
      return senha;
    } catch (error) {
      logger.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  async atualizarStatus(id, status) {
    try {
      const statusValidos = ['AGUARDANDO', 'CHAMADA', 'ATENDIDA', 'CANCELADA'];
      
      if (!statusValidos.includes(status)) {
        throw new Error('Status inválido');
      }

      const senha = await this.prisma.senha.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date()
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              dataNascimento: true,
              sexo: true,
              telefone: true
            }
          }
        }
      });

      logger.info(`Status da senha ${id} atualizado para ${status}`);
      return senha;
    } catch (error) {
      logger.error('Erro ao atualizar status da senha:', error);
      throw error;
    }
  }

  async cancelarSenha(id, motivo) {
    try {
      const senha = await this.prisma.senha.update({
        where: { id },
        data: {
          status: 'CANCELADA',
          updatedAt: new Date()
        }
      });

      logger.info(`Senha ${id} cancelada. Motivo: ${motivo || 'Não informado'}`);
      return senha;
    } catch (error) {
      logger.error('Erro ao cancelar senha:', error);
      throw error;
    }
  }

  async filaAguardando() {
    try {
      // Buscar senhas aguardando ordenadas por prioridade e número
      const senhasAguardando = await this.prisma.senha.findMany({
        where: {
          status: 'AGUARDANDO'
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              dataNascimento: true,
              sexo: true,
              telefone: true
            }
          }
        },
        orderBy: [
          { prioridade: 'desc' }, // Prioridade alta primeiro
          { tipo: 'asc' },        // Tipo normal antes de prioritário
          { numero: 'asc' }       // Número sequencial
        ]
      });

      // Buscar senhas chamadas recentemente (últimas 10)
      const senhasChamadas = await this.prisma.senha.findMany({
        where: {
          status: 'CHAMADA'
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 10
      });

      return {
        aguardando: senhasAguardando,
        chamadas: senhasChamadas,
        totalAguardando: senhasAguardando.length,
        totalChamadas: senhasChamadas.length
      };
    } catch (error) {
      logger.error('Erro ao obter fila de senhas:', error);
      throw error;
    }
  }

  async senhasHoje(tipo) {
    try {
      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

      const where = {
        createdAt: {
          gte: inicioDia,
          lt: fimDia
        }
      };

      if (tipo) {
        where.tipo = tipo;
      }

      const senhas = await this.prisma.senha.findMany({
        where,
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              dataNascimento: true,
              sexo: true,
              telefone: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return senhas;
    } catch (error) {
      logger.error('Erro ao listar senhas de hoje:', error);
      throw error;
    }
  }

  async chamarSenha(id, chamadaPor) {
    try {
      const senha = await this.prisma.senha.findUnique({
        where: { id }
      });

      if (!senha) {
        throw new Error('Senha não encontrada');
      }

      if (senha.status !== 'AGUARDANDO') {
        throw new Error('Apenas senhas aguardando podem ser chamadas');
      }

      const senhaAtualizada = await this.prisma.senha.update({
        where: { id },
        data: {
          status: 'CHAMADA',
          updatedAt: new Date()
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              dataNascimento: true,
              sexo: true,
              telefone: true
            }
          }
        }
      });

      logger.info(`Senha ${id} chamada por usuário ${chamadaPor}`);
      return senhaAtualizada;
    } catch (error) {
      logger.error('Erro ao chamar senha:', error);
      throw error;
    }
  }

  async atenderSenha(id, atendidaPor) {
    try {
      const senha = await this.prisma.senha.findUnique({
        where: { id }
      });

      if (!senha) {
        throw new Error('Senha não encontrada');
      }

      if (!['CHAMADA', 'AGUARDANDO'].includes(senha.status)) {
        throw new Error('Senha não pode ser atendida no status atual');
      }

      const senhaAtualizada = await this.prisma.senha.update({
        where: { id },
        data: {
          status: 'ATENDIDA',
          updatedAt: new Date()
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              dataNascimento: true,
              sexo: true,
              telefone: true
            }
          }
        }
      });

      logger.info(`Senha ${id} atendida por usuário ${atendidaPor}`);
      return senhaAtualizada;
    } catch (error) {
      logger.error('Erro ao atender senha:', error);
      throw error;
    }
  }

  async estatisticasSenhas(dataInicio, dataFim) {
    try {
      const where = {};
      
      if (dataInicio || dataFim) {
        where.createdAt = {};
        if (dataInicio) where.createdAt.gte = new Date(dataInicio);
        if (dataFim) where.createdAt.lte = new Date(dataFim);
      }

      const [
        totalSenhas,
        senhasPorTipo,
        senhasPorStatus,
        senhasPorPrioridade,
        senhasHoje
      ] = await Promise.all([
        this.prisma.senha.count({ where }),
        
        this.prisma.senha.groupBy({
          by: ['tipo'],
          where,
          _count: {
            tipo: true
          }
        }),
        
        this.prisma.senha.groupBy({
          by: ['status'],
          where,
          _count: {
            status: true
          }
        }),
        
        this.prisma.senha.groupBy({
          by: ['prioridade'],
          where,
          _count: {
            prioridade: true
          }
        }),
        
        this.prisma.senha.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      return {
        totalSenhas,
        senhasHoje,
        distribuicaoTipo: senhasPorTipo.reduce((acc, item) => {
          acc[item.tipo] = item._count.tipo;
          return acc;
        }, {}),
        distribuicaoStatus: senhasPorStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        distribuicaoPrioridade: senhasPorPrioridade.reduce((acc, item) => {
          acc[item.prioridade] = item._count.prioridade;
          return acc;
        }, {}),
        periodo: {
          inicio: dataInicio || null,
          fim: dataFim || null
        }
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas de senhas:', error);
      throw error;
    }
  }

  async senhasPorTipo(tipo, { page, limit }) {
    try {
      const skip = (page - 1) * limit;

      const [senhas, total] = await Promise.all([
        this.prisma.senha.findMany({
          where: { tipo },
          include: {
            paciente: {
              select: {
                id: true,
                nome: true,
                cpf: true,
                dataNascimento: true,
                sexo: true,
                telefone: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.senha.count({ where: { tipo } })
      ]);

      return {
        senhas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar senhas por tipo:', error);
      throw error;
    }
  }

  async senhasPorPaciente(pacienteId, { page, limit }) {
    try {
      const skip = (page - 1) * limit;

      const [senhas, total] = await Promise.all([
        this.prisma.senha.findMany({
          where: { pacienteId },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.senha.count({ where: { pacienteId } })
      ]);

      return {
        senhas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar senhas do paciente:', error);
      throw error;
    }
  }

  buildWhereClause(filtros) {
    const where = {};

    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.status) {
      where.status = filtros.status;
    }

    if (filtros.pacienteId) {
      where.pacienteId = filtros.pacienteId;
    }

    if (filtros.dataInicio || filtros.dataFim) {
      where.createdAt = {};
      if (filtros.dataInicio) {
        where.createdAt.gte = new Date(filtros.dataInicio);
      }
      if (filtros.dataFim) {
        where.createdAt.lte = new Date(filtros.dataFim);
      }
    }

    return where;
  }
}
