import { database } from '../utils/database.js';
import { logger } from '../utils/logger.js';

export class TriagemService {
  constructor() {
    this.prisma = database.getPrisma();
  }

  async listarTriagens({ page, limit, filtros }) {
    try {
      const skip = (page - 1) * limit;
      
      const where = this.buildWhereClause(filtros);

      const [triagens, total] = await Promise.all([
        this.prisma.triagem.findMany({
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
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        this.prisma.triagem.count({ where })
      ]);

      return {
        triagens,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar triagens:', error);
      throw error;
    }
  }

  async buscarTriagem(id) {
    try {
      const triagem = await this.prisma.triagem.findUnique({
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
          }
        }
      });

      return triagem;
    } catch (error) {
      logger.error('Erro ao buscar triagem:', error);
      throw error;
    }
  }

  async criarTriagem(dadosTriagem) {
    try {
      const { 
        pacienteId, 
        pressaoArterial, 
        temperatura, 
        frequenciaCardiaca, 
        frequenciaRespiratoria, 
        saturacaoOxigenio, 
        nivelRisco, 
        observacoes, 
        enfermeiroId 
      } = dadosTriagem;

      // Verificar se o paciente existe
      const paciente = await this.prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      // Verificar se o enfermeiro existe
      const enfermeiro = await this.prisma.usuario.findUnique({
        where: { id: enfermeiroId }
      });

      if (!enfermeiro || !['ENFERMEIRO', 'ADMINISTRADOR'].includes(enfermeiro.tipo)) {
        throw new Error('Enfermeiro não encontrado ou inválido');
      }

      const triagem = await this.prisma.triagem.create({
        data: {
          pacienteId,
          usuarioId: enfermeiroId,
          pressaoArterial,
          temperatura: temperatura ? parseFloat(temperatura) : null,
          frequenciaCardiaca: frequenciaCardiaca ? parseInt(frequenciaCardiaca) : null,
          frequenciaRespiratoria: frequenciaRespiratoria ? parseInt(frequenciaRespiratoria) : null,
          saturacaoOxigenio: saturacaoOxigenio ? parseFloat(saturacaoOxigenio) : null,
          nivelRisco: nivelRisco || 'VERDE',
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
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      });

      logger.info(`Triagem criada: ${triagem.id} para paciente ${paciente.nome}`);
      return triagem;
    } catch (error) {
      logger.error('Erro ao criar triagem:', error);
      throw error;
    }
  }

  async atualizarTriagem(id, dadosAtualizacao) {
    try {
      const triagem = await this.prisma.triagem.update({
        where: { id },
        data: {
          ...dadosAtualizacao,
          temperatura: dadosAtualizacao.temperatura ? parseFloat(dadosAtualizacao.temperatura) : undefined,
          frequenciaCardiaca: dadosAtualizacao.frequenciaCardiaca ? parseInt(dadosAtualizacao.frequenciaCardiaca) : undefined,
          frequenciaRespiratoria: dadosAtualizacao.frequenciaRespiratoria ? parseInt(dadosAtualizacao.frequenciaRespiratoria) : undefined,
          saturacaoOxigenio: dadosAtualizacao.saturacaoOxigenio ? parseFloat(dadosAtualizacao.saturacaoOxigenio) : undefined,
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

      logger.info(`Triagem atualizada: ${id}`);
      return triagem;
    } catch (error) {
      logger.error('Erro ao atualizar triagem:', error);
      throw error;
    }
  }

  async triagensPorPaciente(pacienteId, { page, limit }) {
    try {
      const skip = (page - 1) * limit;

      const [triagens, total] = await Promise.all([
        this.prisma.triagem.findMany({
          where: { pacienteId },
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
          },
          skip,
          take: limit
        }),
        this.prisma.triagem.count({ where: { pacienteId } })
      ]);

      return {
        triagens,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar triagens do paciente:', error);
      throw error;
    }
  }

  async triagensHoje(enfermeiroId) {
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

      if (enfermeiroId) {
        where.usuarioId = enfermeiroId;
      }

      const triagens = await this.prisma.triagem.findMany({
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
          createdAt: 'desc'
        }
      });

      return triagens;
    } catch (error) {
      logger.error('Erro ao listar triagens de hoje:', error);
      throw error;
    }
  }

  async filaTriagem() {
    try {
      // Buscar pacientes que ainda não foram triados
      const pacientesSemTriagem = await this.prisma.paciente.findMany({
        where: {
          ativo: true,
          triagens: {
            none: {}
          }
        },
        select: {
          id: true,
          nome: true,
          cpf: true,
          dataNascimento: true,
          sexo: true,
          telefone: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Buscar pacientes com triagem recente (últimas 24h) para estatísticas
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);

      const triagensRecentes = await this.prisma.triagem.findMany({
        where: {
          createdAt: {
            gte: ontem
          }
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        aguardandoTriagem: pacientesSemTriagem,
        triagensRecentes,
        totalAguardando: pacientesSemTriagem.length,
        totalTriadasHoje: triagensRecentes.length
      };
    } catch (error) {
      logger.error('Erro ao obter fila de triagem:', error);
      throw error;
    }
  }

  async classificarRisco(id, nivelRisco, observacoes) {
    try {
      const niveisValidos = ['VERDE', 'AMARELO', 'LARANJA', 'VERMELHO'];
      
      if (!niveisValidos.includes(nivelRisco)) {
        throw new Error('Nível de risco inválido');
      }

      const triagem = await this.prisma.triagem.update({
        where: { id },
        data: {
          nivelRisco,
          observacoes: observacoes || triagem.observacoes,
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

      logger.info(`Risco da triagem ${id} classificado como ${nivelRisco}`);
      return triagem;
    } catch (error) {
      logger.error('Erro ao classificar risco:', error);
      throw error;
    }
  }

  async estatisticasTriagem(dataInicio, dataFim) {
    try {
      const where = {};
      
      if (dataInicio || dataFim) {
        where.createdAt = {};
        if (dataInicio) where.createdAt.gte = new Date(dataInicio);
        if (dataFim) where.createdAt.lte = new Date(dataFim);
      }

      const [
        totalTriagens,
        triagensPorRisco,
        triagensPorEnfermeiro,
        triagensHoje
      ] = await Promise.all([
        this.prisma.triagem.count({ where }),
        
        this.prisma.triagem.groupBy({
          by: ['nivelRisco'],
          where,
          _count: {
            nivelRisco: true
          }
        }),
        
        this.prisma.triagem.groupBy({
          by: ['usuarioId'],
          where,
          _count: {
            usuarioId: true
          },
          _avg: {
            temperatura: true,
            frequenciaCardiaca: true,
            saturacaoOxigenio: true
          }
        }),
        
        this.prisma.triagem.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      // Buscar enfermeiros para estatísticas
      const enfermeiros = await this.prisma.usuario.findMany({
        where: {
          tipo: 'ENFERMEIRO',
          ativo: true
        },
        select: {
          id: true,
          nome: true
        }
      });

      const estatisticasEnfermeiros = triagensPorEnfermeiro.map(t => {
        const enfermeiro = enfermeiros.find(e => e.id === t.usuarioId);
        return {
          enfermeiro: enfermeiro ? enfermeiro.nome : 'Desconhecido',
          totalTriagens: t._count.usuarioId,
          temperaturaMedia: t._avg.temperatura || 0,
          frequenciaCardiacaMedia: t._avg.frequenciaCardiaca || 0,
          saturacaoOxigenioMedia: t._avg.saturacaoOxigenio || 0
        };
      });

      return {
        totalTriagens,
        triagensHoje,
        distribuicaoRisco: triagensPorRisco.reduce((acc, item) => {
          acc[item.nivelRisco] = item._count.nivelRisco;
          return acc;
        }, {}),
        estatisticasEnfermeiros,
        periodo: {
          inicio: dataInicio || null,
          fim: dataFim || null
        }
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas de triagem:', error);
      throw error;
    }
  }

  async triagensPorRisco(nivelRisco, { page, limit }) {
    try {
      const skip = (page - 1) * limit;

      const [triagens, total] = await Promise.all([
        this.prisma.triagem.findMany({
          where: { nivelRisco },
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
        this.prisma.triagem.count({ where: { nivelRisco } })
      ]);

      return {
        triagens,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao listar triagens por risco:', error);
      throw error;
    }
  }

  buildWhereClause(filtros) {
    const where = {};

    if (filtros.nivelRisco) {
      where.nivelRisco = filtros.nivelRisco;
    }

    if (filtros.enfermeiroId) {
      where.usuarioId = filtros.enfermeiroId;
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
