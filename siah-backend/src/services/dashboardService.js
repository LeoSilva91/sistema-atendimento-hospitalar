import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  async overview() {
    try {
      const [
        totalPacientes,
        aguardandoTriagem,
        emTriagem,
        aguardandoMedico,
        emConsulta,
        atendidos
      ] = await Promise.all([
        prisma.paciente.count(),
        prisma.paciente.count({ where: { status: 'AGUARDANDO_TRIAGEM' } }),
        prisma.paciente.count({ where: { status: 'EM_TRIAGEM' } }),
        prisma.paciente.count({ where: { status: 'AGUARDANDO_AVALIACAO_MEDICA' } }),
        prisma.paciente.count({ where: { status: 'EM_CONSULTA' } }),
        prisma.paciente.count({ where: { status: 'ATENDIMENTO_CONCLUIDO' } })
      ]);

      return {
        totalPacientes,
        aguardandoTriagem,
        emTriagem,
        aguardandoMedico,
        emConsulta,
        atendidos
      };
    } catch (error) {
      throw new Error(`Erro ao obter overview: ${error.message}`);
    }
  }

  async obterEstatisticasGerais(filtros = {}) {
    try {
      const { dataInicio, dataFim } = filtros;
      
      const where = {};
      if (dataInicio && dataFim) {
        where.horaCadastro = {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        };
      }

      const [
        totalPacientes,
        aguardandoTriagem,
        emTriagem,
        aguardandoMedico,
        emConsulta,
        atendidos,
        aguardandoExame,
        internados,
        encaminhados,
        porCorTriagem,
        porStatus
      ] = await Promise.all([
        prisma.paciente.count({ where }),
        prisma.paciente.count({ where: { ...where, status: 'AGUARDANDO_TRIAGEM' } }),
        prisma.paciente.count({ where: { ...where, status: 'EM_TRIAGEM' } }),
        prisma.paciente.count({ where: { ...where, status: 'AGUARDANDO_AVALIACAO_MEDICA' } }),
        prisma.paciente.count({ where: { ...where, status: 'EM_CONSULTA' } }),
        prisma.paciente.count({ where: { ...where, status: 'ATENDIMENTO_CONCLUIDO' } }),
        prisma.paciente.count({ where: { ...where, status: 'AGUARDANDO_EXAME' } }),
        prisma.paciente.count({ where: { ...where, status: 'INTERNADO' } }),
        prisma.paciente.count({ where: { ...where, status: 'ENCAMINHADO' } }),
        prisma.paciente.groupBy({
          by: ['corTriagem'],
          where: { ...where, corTriagem: { not: null } },
          _count: { corTriagem: true }
        }),
        prisma.paciente.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        })
      ]);

      return {
        totalPacientes,
        aguardandoTriagem,
        emTriagem,
        aguardandoMedico,
        emConsulta,
        atendidos,
        aguardandoExame,
        internados,
        encaminhados,
        porCorTriagem: porCorTriagem.reduce((acc, item) => {
          acc[item.corTriagem] = item._count.corTriagem;
          return acc;
        }, {}),
        porStatus: porStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas gerais: ${error.message}`);
    }
  }

  async obterDadosFilas() {
    try {
      const [filaTriagem, filaMedico, chamadasAtivas] = await Promise.all([
        prisma.paciente.findMany({
          where: { status: 'AGUARDANDO_TRIAGEM' },
          orderBy: { horaCadastro: 'asc' },
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
        }),
        prisma.paciente.findMany({
          where: { status: 'AGUARDANDO_AVALIACAO_MEDICA' },
          orderBy: [
            { corTriagem: 'desc' },
            { horaFimTriagem: 'asc' }
          ],
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
            numeroProntuario: true
          }
        }),
        prisma.chamada.findMany({
          where: { ativa: true },
          orderBy: { horaChamada: 'desc' },
          take: 10,
          include: {
            paciente: {
              select: {
                id: true,
                nome: true,
                cpf: true,
                numeroProntuario: true,
                corTriagem: true
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
        })
      ]);

      return {
        filaTriagem,
        filaMedico,
        chamadasAtivas
      };
    } catch (error) {
      throw new Error(`Erro ao obter dados das filas: ${error.message}`);
    }
  }

  async obterDadosPainelPublico(filtros = {}) {
    try {
      const { incluirChamadas = true, incluirSenhas = true } = filtros;

      const [
        estatisticas,
        chamadasAtivas,
        senhasChamadas
      ] = await Promise.all([
        this.obterEstatisticasGerais(),
        incluirChamadas ? prisma.chamada.findMany({
          where: { ativa: true },
          orderBy: { horaChamada: 'desc' },
          take: 5,
          include: {
            paciente: {
              select: {
                id: true,
                nome: true,
                cpf: true,
                numeroProntuario: true,
                corTriagem: true
              }
            }
          }
        }) : [],
        incluirSenhas ? prisma.senha.findMany({
          where: { status: 'CHAMADA' },
          orderBy: { horaChamada: 'desc' },
          take: 3,
          include: {
            paciente: {
              select: {
                id: true,
                nome: true,
                cpf: true
              }
            }
          }
        }) : []
      ]);

      return {
        estatisticas,
        chamadasAtivas,
        senhasChamadas
      };
    } catch (error) {
      throw new Error(`Erro ao obter dados do painel público: ${error.message}`);
    }
  }

  async gerarRelatorio(tipo, dataInicio, dataFim, formato = 'json') {
    try {
      const where = {
        horaCadastro: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        }
      };

      let dados;

      switch (tipo) {
        case 'atendimentos':
          dados = await prisma.paciente.findMany({
            where: {
              ...where,
              status: 'ATENDIMENTO_CONCLUIDO'
            },
            include: {
              triagens: {
                include: {
                  usuario: {
                    select: {
                      nome: true,
                      tipo: true
                    }
                  }
                }
              },
              prontuarios: {
                include: {
                  usuario: {
                    select: {
                      nome: true,
                      especialidade: true
                    }
                  }
                }
              }
            },
            orderBy: { horaFimConsulta: 'desc' }
          });
          break;

        case 'triagem':
          dados = await prisma.triagem.findMany({
            where: {
              createdAt: {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
              }
            },
            include: {
              paciente: {
                select: {
                  id: true,
                  nome: true,
                  cpf: true,
                  numeroProntuario: true
                }
              },
              usuario: {
                select: {
                  nome: true,
                  tipo: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
          break;

        case 'pacientes':
          dados = await prisma.paciente.findMany({
            where,
            include: {
              triagens: true,
              prontuarios: true
            },
            orderBy: { horaCadastro: 'desc' }
          });
          break;

        default:
          throw new Error('Tipo de relatório inválido');
      }

      if (formato === 'json') {
        return dados;
      }

      // Aqui você implementaria a geração de PDF ou Excel
      // Por enquanto, retornamos os dados em JSON
      return dados;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }
  }

  async obterMetricasTempoReal() {
    try {
      const agora = new Date();
      const umaHoraAtras = new Date(agora.getTime() - 60 * 60 * 1000);

      const [
        pacientesUltimaHora,
        triagensUltimaHora,
        atendimentosUltimaHora,
        tempoMedioEspera
      ] = await Promise.all([
        prisma.paciente.count({
          where: {
            horaCadastro: { gte: umaHoraAtras }
          }
        }),
        prisma.triagem.count({
          where: {
            createdAt: { gte: umaHoraAtras }
          }
        }),
        prisma.atendimento.count({
          where: {
            createdAt: { gte: umaHoraAtras }
          }
        }),
        this.calcularTempoMedioEspera()
      ]);

      return {
        pacientesUltimaHora,
        triagensUltimaHora,
        atendimentosUltimaHora,
        tempoMedioEspera
      };
    } catch (error) {
      throw new Error(`Erro ao obter métricas em tempo real: ${error.message}`);
    }
  }

  async calcularTempoMedioEspera() {
    try {
      const pacientesAtendidos = await prisma.paciente.findMany({
        where: {
          status: 'ATENDIMENTO_CONCLUIDO',
          horaFimConsulta: { not: null }
        },
        select: {
          horaCadastro: true,
          horaFimConsulta: true
        }
      });

      if (pacientesAtendidos.length === 0) {
        return 0;
      }

      const temposEspera = pacientesAtendidos.map(paciente => {
        const inicio = new Date(paciente.horaCadastro);
        const fim = new Date(paciente.horaFimConsulta);
        return (fim - inicio) / (1000 * 60); // em minutos
      });

      const tempoMedio = temposEspera.reduce((acc, tempo) => acc + tempo, 0) / temposEspera.length;
      return Math.round(tempoMedio);
    } catch (error) {
      return 0;
    }
  }
}