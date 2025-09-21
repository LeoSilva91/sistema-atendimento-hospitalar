import { database } from '../utils/database.js';
import { logger } from '../utils/logger.js';

export class AtendimentoService {
  constructor() {
    this.prisma = database.getPrisma();
  }

  async listarAtendimentos({ page, limit, filtros }) {
    try {
      const skip = (page - 1) * limit;
      
      const where = this.buildWhereClause(filtros);

      const [atendimentos, total] = await Promise.all([
        this.prisma.atendimento.findMany({
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
            },
            usuario: {
              select: {
                id: true,
                nome: true,
                tipo: true
              }
            },
            prontuarios: {
              select: {
                id: true,
                evolucao: true,
                diagnostico: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            dataHora: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.atendimento.count({ where })
      ]);

      return {
        atendimentos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar atendimentos:', error);
      throw error;
    }
  }

  async buscarAtendimento(id) {
    try {
      const atendimento = await this.prisma.atendimento.findUnique({
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
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              email: true
            }
          },
          prontuarios: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  tipo: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      return atendimento;
    } catch (error) {
      logger.error('Erro ao buscar atendimento:', error);
      throw error;
    }
  }

  async criarAtendimento(dadosAtendimento) {
    try {
      const { pacienteId, dataHora, observacoes, medicoId } = dadosAtendimento;

      // Verificar se o paciente existe
      const paciente = await this.prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      // Verificar se o médico existe
      const medico = await this.prisma.usuario.findUnique({
        where: { id: medicoId }
      });

      if (!medico || !['MEDICO', 'ADMINISTRADOR'].includes(medico.tipo)) {
        throw new Error('Médico não encontrado ou inválido');
      }

      const atendimento = await this.prisma.atendimento.create({
        data: {
          pacienteId,
          usuarioId: medicoId,
          dataHora: new Date(dataHora),
          observacoes,
          status: 'AGENDADO'
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
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      });

      logger.info(`Atendimento criado: ${atendimento.id} para paciente ${paciente.nome}`);
      return atendimento;
    } catch (error) {
      logger.error('Erro ao criar atendimento:', error);
      throw error;
    }
  }

  async atualizarAtendimento(id, dadosAtualizacao) {
    try {
      const atendimento = await this.prisma.atendimento.update({
        where: { id },
        data: {
          ...dadosAtualizacao,
          dataHora: dadosAtualizacao.dataHora ? new Date(dadosAtualizacao.dataHora) : undefined,
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
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      });

      logger.info(`Atendimento atualizado: ${id}`);
      return atendimento;
    } catch (error) {
      logger.error('Erro ao atualizar atendimento:', error);
      throw error;
    }
  }

  async atualizarStatus(id, status) {
    try {
      const statusValidos = ['AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
      
      if (!statusValidos.includes(status)) {
        throw new Error('Status inválido');
      }

      const atendimento = await this.prisma.atendimento.update({
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
              cpf: true
            }
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      });

      logger.info(`Status do atendimento ${id} atualizado para ${status}`);
      return atendimento;
    } catch (error) {
      logger.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  async cancelarAtendimento(id, motivo) {
    try {
      const atendimento = await this.prisma.atendimento.update({
        where: { id },
        data: {
          status: 'CANCELADO',
          observacoes: motivo ? `${atendimento.observacoes || ''}\n\nCancelado: ${motivo}` : atendimento.observacoes,
          updatedAt: new Date()
        }
      });

      logger.info(`Atendimento ${id} cancelado. Motivo: ${motivo || 'Não informado'}`);
      return atendimento;
    } catch (error) {
      logger.error('Erro ao cancelar atendimento:', error);
      throw error;
    }
  }

  async atendimentosPorPaciente(pacienteId, { page, limit }) {
    try {
      const skip = (page - 1) * limit;

      const [atendimentos, total] = await Promise.all([
        this.prisma.atendimento.findMany({
          where: { pacienteId },
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                tipo: true
              }
            },
            prontuarios: {
              select: {
                id: true,
                evolucao: true,
                diagnostico: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            dataHora: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.atendimento.count({ where: { pacienteId } })
      ]);

      return {
        atendimentos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar atendimentos do paciente:', error);
      throw error;
    }
  }

  async atendimentosPorMedico(medicoId, { page, limit, dataInicio, dataFim }) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        usuarioId: medicoId
      };

      if (dataInicio || dataFim) {
        where.dataHora = {};
        if (dataInicio) where.dataHora.gte = new Date(dataInicio);
        if (dataFim) where.dataHora.lte = new Date(dataFim);
      }

      const [atendimentos, total] = await Promise.all([
        this.prisma.atendimento.findMany({
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
            },
            prontuarios: {
              select: {
                id: true,
                evolucao: true,
                diagnostico: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            dataHora: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.atendimento.count({ where })
      ]);

      return {
        atendimentos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar atendimentos do médico:', error);
      throw error;
    }
  }

  async atendimentosHoje(medicoId) {
    try {
      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

      const where = {
        dataHora: {
          gte: inicioDia,
          lt: fimDia
        }
      };

      if (medicoId) {
        where.usuarioId = medicoId;
      }

      const atendimentos = await this.prisma.atendimento.findMany({
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
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        },
        orderBy: {
          dataHora: 'asc'
        }
      });

      return atendimentos;
    } catch (error) {
      logger.error('Erro ao listar atendimentos de hoje:', error);
      throw error;
    }
  }

  async iniciarAtendimento(id, medicoId) {
    try {
      const atendimento = await this.prisma.atendimento.findUnique({
        where: { id }
      });

      if (!atendimento) {
        throw new Error('Atendimento não encontrado');
      }

      if (atendimento.status !== 'AGENDADO') {
        throw new Error('Atendimento não pode ser iniciado no status atual');
      }

      if (atendimento.usuarioId !== medicoId) {
        throw new Error('Apenas o médico responsável pode iniciar o atendimento');
      }

      const atendimentoAtualizado = await this.prisma.atendimento.update({
        where: { id },
        data: {
          status: 'EM_ANDAMENTO',
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
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      });

      logger.info(`Atendimento ${id} iniciado pelo médico ${medicoId}`);
      return atendimentoAtualizado;
    } catch (error) {
      logger.error('Erro ao iniciar atendimento:', error);
      throw error;
    }
  }

  async finalizarAtendimento(id, dadosFinalizacao) {
    try {
      const atendimento = await this.prisma.atendimento.findUnique({
        where: { id }
      });

      if (!atendimento) {
        throw new Error('Atendimento não encontrado');
      }

      if (atendimento.status !== 'EM_ANDAMENTO') {
        throw new Error('Apenas atendimentos em andamento podem ser finalizados');
      }

      const atendimentoAtualizado = await this.prisma.atendimento.update({
        where: { id },
        data: {
          status: 'CONCLUIDO',
          observacoes: dadosFinalizacao.observacoes || atendimento.observacoes,
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
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      });

      // Criar prontuário se houver dados
      if (dadosFinalizacao.diagnostico || dadosFinalizacao.prescricao) {
        await this.prisma.prontuario.create({
          data: {
            pacienteId: atendimento.pacienteId,
            atendimentoId: id,
            usuarioId: dadosFinalizacao.finalizadoPor,
            evolucao: dadosFinalizacao.observacoes || '',
            diagnostico: dadosFinalizacao.diagnostico || '',
            prescricao: dadosFinalizacao.prescricao || '',
            exames: '',
            observacoes: ''
          }
        });
      }

      logger.info(`Atendimento ${id} finalizado pelo médico ${dadosFinalizacao.finalizadoPor}`);
      return atendimentoAtualizado;
    } catch (error) {
      logger.error('Erro ao finalizar atendimento:', error);
      throw error;
    }
  }

  buildWhereClause(filtros) {
    const where = {};

    if (filtros.status) {
      where.status = filtros.status;
    }

    if (filtros.medicoId) {
      where.usuarioId = filtros.medicoId;
    }

    if (filtros.pacienteId) {
      where.pacienteId = filtros.pacienteId;
    }

    if (filtros.dataInicio || filtros.dataFim) {
      where.dataHora = {};
      if (filtros.dataInicio) {
        where.dataHora.gte = new Date(filtros.dataInicio);
      }
      if (filtros.dataFim) {
        where.dataHora.lte = new Date(filtros.dataFim);
      }
    }

    return where;
  }
}
