import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ChamadaService {
  async criarChamada(dadosChamada, usuarioId) {
    try {
      const { pacienteId, tipo, local } = dadosChamada;

      // Verificar se paciente existe
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      // Finalizar chamadas ativas do mesmo tipo
      await prisma.chamada.updateMany({
        where: {
          tipo,
          ativa: true
        },
        data: {
          ativa: false
        }
      });

      // Criar nova chamada
      const chamada = await prisma.chamada.create({
        data: {
          pacienteId,
          usuarioId,
          tipo,
          local
        },
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
      });

      return chamada;
    } catch (error) {
      throw new Error(`Erro ao criar chamada: ${error.message}`);
    }
  }

  async listarChamadasAtivas(filtros = {}) {
    try {
      const { tipo, limit = 10 } = filtros;

      const where = { ativa: true };
      if (tipo) where.tipo = tipo;

      const chamadas = await prisma.chamada.findMany({
        where,
        take: limit,
        orderBy: { horaChamada: 'desc' },
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
      });

      return chamadas;
    } catch (error) {
      throw new Error(`Erro ao listar chamadas ativas: ${error.message}`);
    }
  }

  async finalizarChamada(chamadaId) {
    try {
      const chamada = await prisma.chamada.update({
        where: { id: chamadaId },
        data: { ativa: false },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              numeroProntuario: true
            }
          }
        }
      });

      return chamada;
    } catch (error) {
      throw new Error(`Erro ao finalizar chamada: ${error.message}`);
    }
  }

  async finalizarChamadasAntigas() {
    try {
      // Finalizar chamadas com mais de 5 minutos
      const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000);

      const chamadasFinalizadas = await prisma.chamada.updateMany({
        where: {
          ativa: true,
          horaChamada: {
            lt: cincoMinutosAtras
          }
        },
        data: {
          ativa: false
        }
      });

      return chamadasFinalizadas.count;
    } catch (error) {
      throw new Error(`Erro ao finalizar chamadas antigas: ${error.message}`);
    }
  }

  async obterEstatisticasChamadas() {
    try {
      const [
        total,
        ativas,
        porTipo,
        chamadasHoje
      ] = await Promise.all([
        prisma.chamada.count(),
        prisma.chamada.count({ where: { ativa: true } }),
        prisma.chamada.groupBy({
          by: ['tipo'],
          _count: { tipo: true }
        }),
        prisma.chamada.count({
          where: {
            horaChamada: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      return {
        total,
        ativas,
        chamadasHoje,
        porTipo: porTipo.reduce((acc, item) => {
          acc[item.tipo] = item._count.tipo;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas de chamadas: ${error.message}`);
    }
  }

  async buscarChamadaPorId(id) {
    try {
      const chamada = await prisma.chamada.findUnique({
        where: { id },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              numeroProntuario: true,
              corTriagem: true,
              status: true
            }
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              especialidade: true
            }
          }
        }
      });

      if (!chamada) {
        throw new Error('Chamada não encontrada');
      }

      return chamada;
    } catch (error) {
      throw new Error(`Erro ao buscar chamada: ${error.message}`);
    }
  }
}
