import { database } from '../utils/database.js';
import { logger } from '../utils/logger.js';

export class DashboardService {
  constructor() {
    this.prisma = database.getPrisma();
  }

  async overview() {
    try {
      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

      const [
        totalPacientes,
        totalUsuarios,
        atendimentosHoje,
        triagensHoje,
        senhasHoje,
        prontuariosHoje
      ] = await Promise.all([
        this.prisma.paciente.count({ where: { ativo: true } }),
        this.prisma.usuario.count({ where: { ativo: true } }),
        this.prisma.atendimento.count({
          where: {
            dataHora: {
              gte: inicioDia,
              lt: fimDia
            }
          }
        }),
        this.prisma.triagem.count({
          where: {
            createdAt: {
              gte: inicioDia,
              lt: fimDia
            }
          }
        }),
        this.prisma.senha.count({
          where: {
            createdAt: {
              gte: inicioDia,
              lt: fimDia
            }
          }
        }),
        this.prisma.prontuario.count({
          where: {
            createdAt: {
              gte: inicioDia,
              lt: fimDia
            }
          }
        })
      ]);

      return {
        totalPacientes,
        totalUsuarios,
        atendimentosHoje,
        triagensHoje,
        senhasHoje,
        prontuariosHoje,
        data: hoje.toISOString().split('T')[0]
      };
    } catch (error) {
      logger.error('Erro ao obter overview:', error);
      throw error;
    }
  }

  async estatisticas(dataInicio, dataFim) {
    try {
      const where = {};
      
      if (dataInicio || dataFim) {
        where.createdAt = {};
        if (dataInicio) where.createdAt.gte = new Date(dataInicio);
        if (dataFim) where.createdAt.lte = new Date(dataFim);
      }

      const [
        totalPacientes,
        totalUsuarios,
        totalAtendimentos,
        totalTriagens,
        totalSenhas,
        totalProntuarios,
        distribuicaoUsuarios,
        distribuicaoAtendimentos,
        distribuicaoTriagens
      ] = await Promise.all([
        this.prisma.paciente.count({ where: { ativo: true } }),
        this.prisma.usuario.count({ where: { ativo: true } }),
        this.prisma.atendimento.count(where),
        this.prisma.triagem.count(where),
        this.prisma.senha.count(where),
        this.prisma.prontuario.count(where),
        
        this.prisma.usuario.groupBy({
          by: ['tipo'],
          where: { ativo: true },
          _count: { tipo: true }
        }),
        
        this.prisma.atendimento.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        }),
        
        this.prisma.triagem.groupBy({
          by: ['nivelRisco'],
          where,
          _count: { nivelRisco: true }
        })
      ]);

      return {
        totais: {
          pacientes: totalPacientes,
          usuarios: totalUsuarios,
          atendimentos: totalAtendimentos,
          triagens: totalTriagens,
          senhas: totalSenhas,
          prontuarios: totalProntuarios
        },
        distribuicoes: {
          usuarios: distribuicaoUsuarios.reduce((acc, item) => {
            acc[item.tipo] = item._count.tipo;
            return acc;
          }, {}),
          atendimentos: distribuicaoAtendimentos.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {}),
          triagens: distribuicaoTriagens.reduce((acc, item) => {
            acc[item.nivelRisco] = item._count.nivelRisco;
            return acc;
          }, {})
        },
        periodo: {
          inicio: dataInicio || null,
          fim: dataFim || null
        }
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  async statusFilas() {
    try {
      const [
        senhasAguardando,
        senhasChamadas,
        triagensAguardando,
        atendimentosEmAndamento
      ] = await Promise.all([
        this.prisma.senha.count({
          where: { status: 'AGUARDANDO' }
        }),
        this.prisma.senha.count({
          where: { status: 'CHAMADA' }
        }),
        this.prisma.triagem.count({
          where: {
            nivelRisco: { in: ['VERMELHO', 'LARANJA'] }
          }
        }),
        this.prisma.atendimento.count({
          where: { status: 'EM_ANDAMENTO' }
        })
      ]);

      return {
        senhas: {
          aguardando: senhasAguardando,
          chamadas: senhasChamadas,
          total: senhasAguardando + senhasChamadas
        },
        triagens: {
          aguardando: triagensAguardando,
          total: triagensAguardando
        },
        atendimentos: {
          emAndamento: atendimentosEmAndamento,
          total: atendimentosEmAndamento
        }
      };
    } catch (error) {
      logger.error('Erro ao obter status das filas:', error);
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
      logger.error('Erro ao obter atendimentos de hoje:', error);
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
      logger.error('Erro ao obter triagens de hoje:', error);
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
      logger.error('Erro ao obter senhas de hoje:', error);
      throw error;
    }
  }

  async medicosAtivos() {
    try {
      const medicos = await this.prisma.usuario.findMany({
        where: {
          tipo: 'MEDICO',
          ativo: true
        },
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true
        },
        orderBy: {
          nome: 'asc'
        }
      });

      return medicos;
    } catch (error) {
      logger.error('Erro ao obter médicos ativos:', error);
      throw error;
    }
  }

  async pacientesRecentes(limit = 10) {
    try {
      const pacientes = await this.prisma.paciente.findMany({
        where: { ativo: true },
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
          createdAt: 'desc'
        },
        take: limit
      });

      return pacientes;
    } catch (error) {
      logger.error('Erro ao obter pacientes recentes:', error);
      throw error;
    }
  }

  async alertas() {
    try {
      const alertas = [];

      // Verificar senhas aguardando há muito tempo
      const senhasAguardando = await this.prisma.senha.count({
        where: {
          status: 'AGUARDANDO',
          createdAt: {
            lt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
          }
        }
      });

      if (senhasAguardando > 0) {
        alertas.push({
          tipo: 'warning',
          titulo: 'Senhas Aguardando',
          mensagem: `${senhasAguardando} senha(s) aguardando há mais de 2 horas`,
          prioridade: 'media'
        });
      }

      // Verificar triagens de alto risco
      const triagensAltoRisco = await this.prisma.triagem.count({
        where: {
          nivelRisco: { in: ['VERMELHO', 'LARANJA'] },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24 horas
          }
        }
      });

      if (triagensAltoRisco > 0) {
        alertas.push({
          tipo: 'danger',
          titulo: 'Triagens de Alto Risco',
          mensagem: `${triagensAltoRisco} triagem(ns) de alto risco nas últimas 24 horas`,
          prioridade: 'alta'
        });
      }

      // Verificar atendimentos em andamento há muito tempo
      const atendimentosLongos = await this.prisma.atendimento.count({
        where: {
          status: 'EM_ANDAMENTO',
          dataHora: {
            lt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 horas atrás
          }
        }
      });

      if (atendimentosLongos > 0) {
        alertas.push({
          tipo: 'warning',
          titulo: 'Atendimentos Longos',
          mensagem: `${atendimentosLongos} atendimento(s) em andamento há mais de 4 horas`,
          prioridade: 'media'
        });
      }

      return alertas;
    } catch (error) {
      logger.error('Erro ao obter alertas:', error);
      throw error;
    }
  }

  async relatorios() {
    try {
      const relatorios = [
        {
          id: 'atendimentos-por-medico',
          nome: 'Atendimentos por Médico',
          descricao: 'Relatório de atendimentos realizados por cada médico',
          tipo: 'atendimento',
          parametros: ['dataInicio', 'dataFim', 'medicoId']
        },
        {
          id: 'triagens-por-risco',
          nome: 'Triagens por Nível de Risco',
          descricao: 'Distribuição de triagens por nível de risco',
          tipo: 'triagem',
          parametros: ['dataInicio', 'dataFim', 'nivelRisco']
        },
        {
          id: 'senhas-por-tipo',
          nome: 'Senhas por Tipo',
          descricao: 'Relatório de senhas geradas por tipo',
          tipo: 'senha',
          parametros: ['dataInicio', 'dataFim', 'tipo']
        },
        {
          id: 'pacientes-por-periodo',
          nome: 'Pacientes por Período',
          descricao: 'Relatório de pacientes cadastrados por período',
          tipo: 'paciente',
          parametros: ['dataInicio', 'dataFim']
        },
        {
          id: 'prontuarios-por-medico',
          nome: 'Prontuários por Médico',
          descricao: 'Relatório de prontuários criados por médico',
          tipo: 'prontuario',
          parametros: ['dataInicio', 'dataFim', 'medicoId']
        }
      ];

      return relatorios;
    } catch (error) {
      logger.error('Erro ao obter relatórios:', error);
      throw error;
    }
  }
}
