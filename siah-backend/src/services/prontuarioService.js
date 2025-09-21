import { database } from '../utils/database.js';
import { logger } from '../utils/logger.js';

export class ProntuarioService {
  constructor() {
    this.prisma = database.getPrisma();
  }

  async listarProntuarios({ page, limit, filtros }) {
    try {
      const skip = (page - 1) * limit;
      
      const where = this.buildWhereClause(filtros);

      const [prontuarios, total] = await Promise.all([
        this.prisma.prontuario.findMany({
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
            atendimento: {
              select: {
                id: true,
                dataHora: true,
                status: true
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
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.prontuario.count({ where })
      ]);

      return {
        prontuarios,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar prontuários:', error);
      throw error;
    }
  }

  async buscarProntuario(id) {
    try {
      const prontuario = await this.prisma.prontuario.findUnique({
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
          atendimento: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  tipo: true
                }
              }
            }
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              email: true
            }
          }
        }
      });

      return prontuario;
    } catch (error) {
      logger.error('Erro ao buscar prontuário:', error);
      throw error;
    }
  }

  async criarProntuario(dadosProntuario) {
    try {
      const { 
        pacienteId, 
        atendimentoId, 
        evolucao, 
        diagnostico, 
        prescricao, 
        exames, 
        observacoes, 
        medicoId 
      } = dadosProntuario;

      // Verificar se o paciente existe
      const paciente = await this.prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      // Verificar se o atendimento existe
      const atendimento = await this.prisma.atendimento.findUnique({
        where: { id: atendimentoId }
      });

      if (!atendimento) {
        throw new Error('Atendimento não encontrado');
      }

      // Verificar se o médico existe
      const medico = await this.prisma.usuario.findUnique({
        where: { id: medicoId }
      });

      if (!medico || !['MEDICO', 'ADMINISTRADOR'].includes(medico.tipo)) {
        throw new Error('Médico não encontrado ou inválido');
      }

      const prontuario = await this.prisma.prontuario.create({
        data: {
          pacienteId,
          atendimentoId,
          usuarioId: medicoId,
          evolucao,
          diagnostico,
          prescricao,
          exames,
          observacoes
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
          atendimento: {
            select: {
              id: true,
              dataHora: true,
              status: true
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

      logger.info(`Prontuário criado: ${prontuario.id} para paciente ${paciente.nome}`);
      return prontuario;
    } catch (error) {
      logger.error('Erro ao criar prontuário:', error);
      throw error;
    }
  }

  async atualizarProntuario(id, dadosAtualizacao) {
    try {
      const prontuario = await this.prisma.prontuario.update({
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
          },
          atendimento: {
            select: {
              id: true,
              dataHora: true,
              status: true
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

      logger.info(`Prontuário atualizado: ${id}`);
      return prontuario;
    } catch (error) {
      logger.error('Erro ao atualizar prontuário:', error);
      throw error;
    }
  }

  async excluirProntuario(id) {
    try {
      await this.prisma.prontuario.delete({
        where: { id }
      });

      logger.info(`Prontuário excluído: ${id}`);
    } catch (error) {
      logger.error('Erro ao excluir prontuário:', error);
      throw error;
    }
  }

  async prontuariosPorPaciente(pacienteId, { page, limit }) {
    try {
      const skip = (page - 1) * limit;

      const [prontuarios, total] = await Promise.all([
        this.prisma.prontuario.findMany({
          where: { pacienteId },
          include: {
            atendimento: {
              select: {
                id: true,
                dataHora: true,
                status: true
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
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.prontuario.count({ where: { pacienteId } })
      ]);

      return {
        prontuarios,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar prontuários do paciente:', error);
      throw error;
    }
  }

  async prontuariosPorAtendimento(atendimentoId, { page, limit }) {
    try {
      const skip = (page - 1) * limit;

      const [prontuarios, total] = await Promise.all([
        this.prisma.prontuario.findMany({
          where: { atendimentoId },
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
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.prontuario.count({ where: { atendimentoId } })
      ]);

      return {
        prontuarios,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar prontuários do atendimento:', error);
      throw error;
    }
  }

  async prontuariosPorMedico(medicoId, { page, limit, dataInicio, dataFim }) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        usuarioId: medicoId
      };

      if (dataInicio || dataFim) {
        where.createdAt = {};
        if (dataInicio) where.createdAt.gte = new Date(dataInicio);
        if (dataFim) where.createdAt.lte = new Date(dataFim);
      }

      const [prontuarios, total] = await Promise.all([
        this.prisma.prontuario.findMany({
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
            atendimento: {
              select: {
                id: true,
                dataHora: true,
                status: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.prontuario.count({ where })
      ]);

      return {
        prontuarios,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar prontuários do médico:', error);
      throw error;
    }
  }

  async prontuariosHoje(medicoId) {
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

      if (medicoId) {
        where.usuarioId = medicoId;
      }

      const prontuarios = await this.prisma.prontuario.findMany({
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
          atendimento: {
            select: {
              id: true,
              dataHora: true,
              status: true
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
          createdAt: 'desc'
        }
      });

      return prontuarios;
    } catch (error) {
      logger.error('Erro ao listar prontuários de hoje:', error);
      throw error;
    }
  }

  async adicionarEvolucao(id, evolucao, medicoId) {
    try {
      const prontuario = await this.prisma.prontuario.findUnique({
        where: { id }
      });

      if (!prontuario) {
        throw new Error('Prontuário não encontrado');
      }

      const evolucaoAtualizada = `${prontuario.evolucao}\n\n--- Nova Evolução (${new Date().toLocaleString('pt-BR')}) ---\n${evolucao}`;

      const prontuarioAtualizado = await this.prisma.prontuario.update({
        where: { id },
        data: {
          evolucao: evolucaoAtualizada,
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
          atendimento: {
            select: {
              id: true,
              dataHora: true,
              status: true
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

      logger.info(`Evolução adicionada ao prontuário ${id} pelo médico ${medicoId}`);
      return prontuarioAtualizado;
    } catch (error) {
      logger.error('Erro ao adicionar evolução:', error);
      throw error;
    }
  }

  async estatisticasProntuarios(dataInicio, dataFim) {
    try {
      const where = {};
      
      if (dataInicio || dataFim) {
        where.createdAt = {};
        if (dataInicio) where.createdAt.gte = new Date(dataInicio);
        if (dataFim) where.createdAt.lte = new Date(dataFim);
      }

      const [
        totalProntuarios,
        prontuariosPorMedico,
        prontuariosHoje
      ] = await Promise.all([
        this.prisma.prontuario.count({ where }),
        
        this.prisma.prontuario.groupBy({
          by: ['usuarioId'],
          where,
          _count: {
            usuarioId: true
          }
        }),
        
        this.prisma.prontuario.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      // Buscar médicos para estatísticas
      const medicos = await this.prisma.usuario.findMany({
        where: {
          tipo: 'MEDICO',
          ativo: true
        },
        select: {
          id: true,
          nome: true
        }
      });

      const estatisticasMedicos = prontuariosPorMedico.map(p => {
        const medico = medicos.find(m => m.id === p.usuarioId);
        return {
          medico: medico ? medico.nome : 'Desconhecido',
          totalProntuarios: p._count.usuarioId
        };
      });

      return {
        totalProntuarios,
        prontuariosHoje,
        estatisticasMedicos,
        periodo: {
          inicio: dataInicio || null,
          fim: dataFim || null
        }
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas de prontuários:', error);
      throw error;
    }
  }

  buildWhereClause(filtros) {
    const where = {};

    if (filtros.pacienteId) {
      where.pacienteId = filtros.pacienteId;
    }

    if (filtros.medicoId) {
      where.usuarioId = filtros.medicoId;
    }

    if (filtros.atendimentoId) {
      where.atendimentoId = filtros.atendimentoId;
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
