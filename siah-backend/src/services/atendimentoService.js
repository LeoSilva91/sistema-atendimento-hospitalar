import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AtendimentoService {
  async iniciarAtendimento(pacienteId, usuarioId) {
    try {
      // Verificar se paciente existe e está aguardando avaliação médica
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      if (paciente.status !== 'AGUARDANDO_AVALIACAO_MEDICA') {
        throw new Error('Paciente não está aguardando avaliação médica');
      }

      // Atualizar status do paciente
      const pacienteAtualizado = await prisma.paciente.update({
        where: { id: pacienteId },
        data: {
          status: 'EM_CONSULTA',
          horaInicioConsulta: new Date()
        }
      });

      // Criar registro de atendimento
      const atendimento = await prisma.atendimento.create({
        data: {
          pacienteId,
          usuarioId,
          status: 'EM_ANDAMENTO'
        }
      });

      return {
        paciente: pacienteAtualizado,
        atendimento
      };
    } catch (error) {
      throw new Error(`Erro ao iniciar atendimento: ${error.message}`);
    }
  }

  async finalizarAtendimento(dadosAtendimento, usuarioId) {
    try {

      const { 
        pacienteId, 
        diagnostico, 
        condutas, 
        prescricoes, 
        exames, 
        orientacoes, 
        encaminhamento, 
        dataRetorno, 
        statusFinal 
      } = dadosAtendimento;

      // Verificar se paciente está em consulta
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      });


      if (!paciente) {
        throw new Error('Paciente não encontrado');
      }

      if (paciente.status !== 'EM_CONSULTA') {
        throw new Error(`Paciente não está em consulta. Status atual: ${paciente.status}`);
      }

      // Buscar atendimento ativo
      const atendimento = await prisma.atendimento.findFirst({
        where: {
          pacienteId,
          status: 'EM_ANDAMENTO'
        }
      });


      if (!atendimento) {
        throw new Error('Atendimento não encontrado');
      }

      // Atualizar paciente com dados da consulta
      const pacienteAtualizado = await prisma.paciente.update({
        where: { id: pacienteId },
        data: {
          status: statusFinal,
          diagnostico,
          condutas,
          prescricoes: prescricoes || [],
          exames: exames || [],
          orientacoes,
          encaminhamento,
          dataRetorno: dataRetorno ? new Date(dataRetorno) : null,
          horaFimConsulta: new Date()
        }
      });

      // Finalizar atendimento
      const atendimentoFinalizado = await prisma.atendimento.update({
        where: { id: atendimento.id },
        data: {
          status: 'CONCLUIDO'
        }
      });

      // Criar prontuário
      const prontuario = await prisma.prontuario.create({
        data: {
          pacienteId,
          atendimentoId: atendimento.id,
          usuarioId,
          diagnostico,
          condutas,
          prescricoes: prescricoes || [],
          exames: exames || [],
          orientacoes,
          encaminhamento,
          dataRetorno: dataRetorno ? new Date(dataRetorno) : null,
          statusFinal
        }
      });

      return {
        paciente: pacienteAtualizado,
        atendimento: atendimentoFinalizado,
        prontuario
      };
    } catch (error) {
      throw new Error(`Erro ao finalizar atendimento: ${error.message}`);
    }
  }

  async listarFilaMedico() {
    try {
      const pacientes = await prisma.paciente.findMany({
        where: { status: 'AGUARDANDO_AVALIACAO_MEDICA' },
        orderBy: [
          { corTriagem: 'desc' }, // Prioridade por cor de triagem
          { horaFimTriagem: 'asc' } // FIFO dentro da mesma prioridade
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
          numeroProntuario: true,
          sinaisVitais: true
        }
      });

      return pacientes;
    } catch (error) {
      throw new Error(`Erro ao listar fila de médico: ${error.message}`);
    }
  }

  async obterEstatisticasAtendimento(filtros = {}) {
    try {
      const { dataInicio, dataFim } = filtros;
      
      const where = {};
      if (dataInicio && dataFim) {
        where.horaFimConsulta = {
          gte: new Date(dataInicio),
          lte: new Date(dataFim)
        };
      }

      const [
        total,
        porStatus,
        porCorTriagem,
        aguardandoMedico,
        emConsulta,
        atendidos
      ] = await Promise.all([
        prisma.paciente.count({ where: { horaFimConsulta: { not: null } } }),
        prisma.paciente.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        prisma.paciente.groupBy({
          by: ['corTriagem'],
          where: { corTriagem: { not: null } },
          _count: { corTriagem: true }
        }),
        prisma.paciente.count({ where: { status: 'AGUARDANDO_AVALIACAO_MEDICA' } }),
        prisma.paciente.count({ where: { status: 'EM_CONSULTA' } }),
        prisma.paciente.count({ where: { status: 'ATENDIMENTO_CONCLUIDO' } })
      ]);

      return {
        total,
        aguardandoMedico,
        emConsulta,
        atendidos,
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
      throw new Error(`Erro ao obter estatísticas de atendimento: ${error.message}`);
    }
  }

  async buscarAtendimentoPorPaciente(pacienteId) {
    try {
      const atendimentos = await prisma.atendimento.findMany({
        where: { pacienteId },
        orderBy: { createdAt: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              especialidade: true
            }
          },
          prontuarios: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return atendimentos;
    } catch (error) {
      throw new Error(`Erro ao buscar atendimentos: ${error.message}`);
    }
  }

  async buscarProntuariosPorPaciente(pacienteId) {
    try {
      const prontuarios = await prisma.prontuario.findMany({
        where: { pacienteId },
        orderBy: { createdAt: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              especialidade: true
            }
          },
          atendimento: {
            select: {
              id: true,
              dataHora: true,
              status: true
            }
          }
        }
      });

      return prontuarios;
    } catch (error) {
      throw new Error(`Erro ao buscar prontuários: ${error.message}`);
    }
  }
}