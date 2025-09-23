import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FichaService {
  async emitirFicha(pacienteId) {
    try {
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      // Verificar se já existe ficha para este paciente
      const fichaExistente = await prisma.ficha.findFirst({
        where: { 
          pacienteId,
          status: { in: ['AGUARDANDO_TRIAGEM', 'EM_TRIAGEM', 'AGUARDANDO_AVALIACAO_MEDICA', 'EM_CONSULTA'] }
        }
      });

      if (fichaExistente) {
        return fichaExistente;
      }

      // Gerar número da ficha
      const ultimaFicha = await prisma.ficha.findFirst({
        orderBy: { numeroFicha: 'desc' }
      });

      const numeroFicha = ultimaFicha ? 
        `F${String(parseInt(ultimaFicha.numeroFicha.substring(1)) + 1).padStart(4, '0')}` :
        'F0001';

      const ficha = await prisma.ficha.create({
        data: {
          numeroFicha,
          pacienteId,
          corTriagem: paciente.corTriagem,
          status: paciente.status
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              numeroProntuario: true,
              motivoVisita: true,
              corTriagem: true,
              status: true
            }
          }
        }
      });

      return ficha;
    } catch (error) {
      throw new Error(`Erro ao emitir ficha: ${error.message}`);
    }
  }

  async listarFichas(filtros = {}) {
    try {
      const { page = 1, limit = 10, status, corTriagem, search } = filtros;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (corTriagem) where.corTriagem = corTriagem;
      if (search) {
        where.OR = [
          { numeroFicha: { contains: search } },
          { paciente: { nome: { contains: search } } },
          { paciente: { cpf: { contains: search } } }
        ];
      }

      const [fichas, total] = await Promise.all([
        prisma.ficha.findMany({
          where,
          skip,
          take: limit,
          orderBy: { horaEmissao: 'desc' },
          include: {
            paciente: {
              select: {
                id: true,
                nome: true,
                cpf: true,
                numeroProntuario: true,
                motivoVisita: true,
                status: true
              }
            }
          }
        }),
        prisma.ficha.count({ where })
      ]);

      return {
        data: fichas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erro ao listar fichas: ${error.message}`);
    }
  }

  async buscarFichaPorId(id) {
    try {
      const ficha = await prisma.ficha.findUnique({
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
              endereco: true,
              numeroProntuario: true,
              motivoVisita: true,
              queixaPrincipal: true,
              corTriagem: true,
              status: true,
              sinaisVitais: true,
              diagnostico: true,
              condutas: true,
              prescricoes: true,
              exames: true,
              orientacoes: true,
              encaminhamento: true
            }
          }
        }
      });

      if (!ficha) {
        throw new Error('Ficha não encontrada');
      }

      return ficha;
    } catch (error) {
      throw new Error(`Erro ao buscar ficha: ${error.message}`);
    }
  }

  async atualizarStatusFicha(fichaId, status) {
    try {
      const ficha = await prisma.ficha.update({
        where: { id: fichaId },
        data: { status },
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

      return ficha;
    } catch (error) {
      throw new Error(`Erro ao atualizar status da ficha: ${error.message}`);
    }
  }

  async obterEstatisticasFichas() {
    try {
      const [
        total,
        porStatus,
        porCorTriagem,
        emitidasHoje
      ] = await Promise.all([
        prisma.ficha.count(),
        prisma.ficha.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        prisma.ficha.groupBy({
          by: ['corTriagem'],
          where: { corTriagem: { not: null } },
          _count: { corTriagem: true }
        }),
        prisma.ficha.count({
          where: {
            horaEmissao: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      return {
        total,
        emitidasHoje,
        porStatus: porStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
        porCorTriagem: porCorTriagem.reduce((acc, item) => {
          acc[item.corTriagem] = item._count.corTriagem;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas de fichas: ${error.message}`);
    }
  }
}
