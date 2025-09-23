import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SenhaService {
  async gerarSenha(tipo) {
    try {
      // Buscar última senha do tipo para gerar número sequencial
      const ultimaSenha = await prisma.senha.findFirst({
        where: { tipo },
        orderBy: { numero: 'desc' }
      });

      const numero = ultimaSenha ? ultimaSenha.numero + 1 : 1;
      const prefixo = tipo === 'PRIORIDADE' ? 'P' : 'N';

      const senha = await prisma.senha.create({
        data: {
          numero,
          prefixo,
          tipo,
          prioridade: tipo === 'PRIORIDADE' ? 'ALTA' : 'MEDIA'
        }
      });

      return senha;
    } catch (error) {
      throw new Error(`Erro ao gerar senha: ${error.message}`);
    }
  }

  async listarSenhasAguardando() {
    try {
      const senhas = await prisma.senha.findMany({
        where: { status: 'AGUARDANDO' },
        orderBy: [
          { prioridade: 'desc' },
          { horaGeracao: 'asc' }
        ],
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true
            }
          }
        }
      });

      return senhas;
    } catch (error) {
      throw new Error(`Erro ao listar senhas: ${error.message}`);
    }
  }

  async chamarSenha(senhaId, usuarioId) {
    try {
      const senha = await prisma.senha.update({
        where: { id: senhaId },
        data: {
          status: 'CHAMADA',
          horaChamada: new Date(),
          usuarioId
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true
            }
          }
        }
      });

      return senha;
    } catch (error) {
      throw new Error(`Erro ao chamar senha: ${error.message}`);
    }
  }

  async marcarSenhaCadastrada(senhaId, pacienteId) {
    try {
      const senha = await prisma.senha.update({
        where: { id: senhaId },
        data: {
          status: 'CADASTRADO',
          horaCadastro: new Date(),
          pacienteId
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              cpf: true
            }
          }
        }
      });

      return senha;
    } catch (error) {
      throw new Error(`Erro ao marcar senha como cadastrada: ${error.message}`);
    }
  }

  async listarSenhas(filtros = {}) {
    try {
      const { page = 1, limit = 10, status, tipo, search } = filtros;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (tipo) where.tipo = tipo;
      if (search) {
        where.OR = [
          { prefixo: { contains: search } },
          { numero: { equals: parseInt(search) || 0 } }
        ];
      }

      const [senhas, total] = await Promise.all([
        prisma.senha.findMany({
          where,
          skip,
          take: limit,
          orderBy: { horaGeracao: 'desc' },
          include: {
            paciente: {
              select: {
                id: true,
                nome: true,
                cpf: true
              }
            }
          }
        }),
        prisma.senha.count({ where })
      ]);

      return {
        data: senhas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erro ao listar senhas: ${error.message}`);
    }
  }

  async buscarSenhaPorId(id) {
    try {
      const senha = await prisma.senha.findUnique({
        where: { id },
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

      if (!senha) {
        throw new Error('Senha não encontrada');
      }

      return senha;
    } catch (error) {
      throw new Error(`Erro ao buscar senha: ${error.message}`);
    }
  }

  async obterEstatisticasSenhas() {
    try {
      const [
        total,
        aguardando,
        chamadas,
        cadastradas,
        atendidas,
        porTipo
      ] = await Promise.all([
        prisma.senha.count(),
        prisma.senha.count({ where: { status: 'AGUARDANDO' } }),
        prisma.senha.count({ where: { status: 'CHAMADA' } }),
        prisma.senha.count({ where: { status: 'CADASTRADO' } }),
        prisma.senha.count({ where: { status: 'ATENDIDA' } }),
        prisma.senha.groupBy({
          by: ['tipo'],
          _count: { tipo: true }
        })
      ]);

      return {
        total,
        aguardando,
        chamadas,
        cadastradas,
        atendidas,
        porTipo: porTipo.reduce((acc, item) => {
          acc[item.tipo] = item._count.tipo;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
  }
}